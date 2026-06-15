// src/__tests__/composables/useGitHubApi.test.js
// Tests for the GitHub API client. fetch is mocked; repo derivation from the
// (happy-dom localhost) URL returns null, so tests drive it via the override.
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  useGitHubApi,
  encodeBase64,
  decodeBase64,
  deriveRepoFromLocation,
} from "@/composables/useGitHubApi";
import { useAdminToken } from "@/composables/useAdminToken";

function mockFetchOnce(status, json) {
  return vi.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: () => Promise.resolve(json),
  });
}

beforeEach(() => {
  const { saveToken, saveRepoOverride } = useAdminToken();
  saveToken("tok");
  saveRepoOverride("octo/repo");
});

// NOTE: do not call vi.unstubAllGlobals() here — it would also remove the
// localStorage mock installed in src/__tests__/setup.js. Each test that needs
// fetch installs its own stub.

// ---------- base64 round-trip ----------

describe("base64 helpers", () => {
  it("UTF-8（日本語）を安全に往復できる", () => {
    const text = "公休,法休,早番\n夜勤🌙";
    expect(decodeBase64(encodeBase64(text))).toBe(text);
  });
});

// ---------- repo resolution ----------

describe("resolveRepo()", () => {
  it("override を優先する", () => {
    const { resolveRepo } = useGitHubApi();
    expect(resolveRepo()).toEqual({
      owner: "octo",
      repo: "repo",
      source: "override",
    });
  });

  it("override が無く localhost なら null（URL から特定できない）", () => {
    useAdminToken().saveRepoOverride(null);
    const { resolveRepo } = useGitHubApi();
    expect(resolveRepo()).toBeNull();
  });
});

describe("deriveRepoFromLocation()", () => {
  it("localhost では null", () => {
    // happy-dom の hostname は localhost
    expect(deriveRepoFromLocation()).toBeNull();
  });
});

// ---------- verifyToken ----------

describe("verifyToken()", () => {
  it("/user と /repos を叩いて結果をまとめる", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ login: "octocat" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            permissions: { push: true },
            default_branch: "main",
          }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { verifyToken } = useGitHubApi();
    const info = await verifyToken();

    expect(info).toEqual({
      login: "octocat",
      owner: "octo",
      repo: "repo",
      source: "override",
      canPush: true,
      defaultBranch: "main",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.headers.Authorization).toBe("Bearer tok");
  });

  it("API エラーはメッセージ付きで throw する", async () => {
    vi.stubGlobal("fetch", mockFetchOnce(401, { message: "Bad credentials" }));
    const { verifyToken } = useGitHubApi();
    await expect(verifyToken()).rejects.toThrow("Bad credentials");
  });

  it("repo を特定できないと throw する", async () => {
    useAdminToken().saveRepoOverride(null);
    const { verifyToken } = useGitHubApi();
    await expect(verifyToken()).rejects.toThrow(/リポジトリを特定/);
  });
});

// ---------- getFile / putFile ----------

describe("getFile()", () => {
  it("内容を base64 デコードして返す", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchOnce(200, { content: encodeBase64("hello"), sha: "abc" }),
    );
    const { getFile } = useGitHubApi();
    expect(await getFile("config/config.json")).toEqual({
      content: "hello",
      sha: "abc",
    });
  });

  it("404 のときは null を返す", async () => {
    vi.stubGlobal("fetch", mockFetchOnce(404, { message: "Not Found" }));
    const { getFile } = useGitHubApi();
    expect(await getFile("missing.txt")).toBeNull();
  });
});

describe("putFile()", () => {
  it("PUT で content を base64 化して送り commit sha を返す", async () => {
    const fetchMock = mockFetchOnce(200, { commit: { sha: "deadbeef" } });
    vi.stubGlobal("fetch", fetchMock);

    const { putFile } = useGitHubApi();
    const sha = await putFile({
      path: "data/x.csv",
      content: "公休,,",
      message: "update",
      sha: "old",
    });

    expect(sha).toBe("deadbeef");
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain("/repos/octo/repo/contents/data/x.csv");
    expect(opts.method).toBe("PUT");
    const body = JSON.parse(opts.body);
    expect(decodeBase64(body.content)).toBe("公休,,");
    expect(body.sha).toBe("old");
  });
});

// ---------- commitFiles (Trees API) ----------

describe("commitFiles()", () => {
  it("ref→commit→tree→commit→ref の順で1コミットにまとめる", async () => {
    const fetchMock = vi
      .fn()
      // 1. get ref
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ object: { sha: "base-commit" } }),
      })
      // 2. get base commit
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ tree: { sha: "base-tree" } }),
      })
      // 3. create tree
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ sha: "new-tree" }),
      })
      // 4. create commit
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ sha: "new-commit" }),
      })
      // 5. patch ref
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { commitFiles } = useGitHubApi();
    const sha = await commitFiles({
      message: "import",
      branch: "main",
      files: [
        { path: "data/rev/weekday.csv", content: "公休,,\n" },
        { path: "config/config.json", content: "{}\n" },
      ],
    });

    expect(sha).toBe("new-commit");
    expect(fetchMock).toHaveBeenCalledTimes(5);

    // tree call carries both files with inline content
    const treeBody = JSON.parse(fetchMock.mock.calls[2][1].body);
    expect(treeBody.base_tree).toBe("base-tree");
    expect(treeBody.tree).toHaveLength(2);
    expect(treeBody.tree[0]).toMatchObject({
      path: "data/rev/weekday.csv",
      mode: "100644",
      type: "blob",
    });

    // commit call references the new tree and parent
    const commitBody = JSON.parse(fetchMock.mock.calls[3][1].body);
    expect(commitBody.tree).toBe("new-tree");
    expect(commitBody.parents).toEqual(["base-commit"]);

    // ref patch advances to the new commit
    const refCall = fetchMock.mock.calls[4];
    expect(refCall[1].method).toBe("PATCH");
    expect(JSON.parse(refCall[1].body).sha).toBe("new-commit");
  });

  it("ファイルが空なら throw", async () => {
    const { commitFiles } = useGitHubApi();
    await expect(commitFiles({ files: [] })).rejects.toThrow(/ファイル/);
  });

  it("delete:true のエントリは tree で sha:null になる", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ object: { sha: "c0" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ tree: { sha: "t0" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ sha: "t1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ sha: "c1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { commitFiles } = useGitHubApi();
    await commitFiles({
      message: "delete",
      branch: "main",
      files: [
        { path: "data/old/weekday.csv", delete: true },
        { path: "config/config.json", content: "{}\n" },
      ],
    });

    const treeBody = JSON.parse(fetchMock.mock.calls[2][1].body);
    expect(treeBody.tree[0]).toEqual({
      path: "data/old/weekday.csv",
      mode: "100644",
      type: "blob",
      sha: null,
    });
    expect(treeBody.tree[1]).toMatchObject({
      path: "config/config.json",
      content: "{}\n",
    });
  });
});

// ---------- listDir ----------

describe("listDir()", () => {
  it("ディレクトリ配下を {name,path,type} で返す", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchOnce(200, [
        { name: "default", path: "data/default", type: "dir" },
        { name: "menu", path: "data/menu", type: "dir" },
      ]),
    );
    const { listDir } = useGitHubApi();
    const entries = await listDir("data");
    expect(entries).toEqual([
      { name: "default", path: "data/default", type: "dir" },
      { name: "menu", path: "data/menu", type: "dir" },
    ]);
  });

  it("404 のときは空配列", async () => {
    vi.stubGlobal("fetch", mockFetchOnce(404, { message: "Not Found" }));
    const { listDir } = useGitHubApi();
    expect(await listDir("data/nope")).toEqual([]);
  });
});
