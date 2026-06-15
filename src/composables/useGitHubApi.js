// GitHub API client for the admin page.
//
// Responsibilities:
//   - Resolve the target repo (owner/name) — auto-derived from the GitHub Pages
//     URL so forks are zero-config; falls back to the admin-local override for
//     local dev / custom domains.
//   - Authenticate with the admin's fine-grained PAT (from useAdminToken).
//   - Read/write files via the Contents API (UTF-8-safe base64).
//
// This client is the plumbing for Phases 2/3 (drag-and-drop import, config forms).
// Phase 1 only needs verifyToken() to prove the connection works end-to-end.

import { useAdminToken, normalizeRepo } from "@/composables/useAdminToken";

const API_ROOT = "https://api.github.com";

// Derive { owner, repo } from a GitHub Pages URL, or null if not derivable.
//   bn-k1.github.io + base "/kobancalendar/" -> { owner: bn-k1, repo: kobancalendar }
//   bn-k1.github.io + base "/"               -> { owner: bn-k1, repo: bn-k1.github.io }
//   localhost / example.com (custom domain)  -> null
export function deriveRepoFromLocation() {
  const host = (window.location.hostname || "").toLowerCase();
  const match = host.match(/^([a-z0-9-]+)\.github\.io$/i);
  if (!match) return null;
  const owner = match[1];
  const base = (import.meta.env.BASE_URL || "/").replace(/^\/+|\/+$/g, "");
  const repo = base || `${owner}.github.io`;
  return { owner, repo };
}

// UTF-8-safe base64 (btoa/atob are latin1-only; GitHub Contents API is base64).
export function encodeBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function decodeBase64(b64) {
  const binary = atob((b64 || "").replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function useGitHubApi() {
  const { readToken, readRepoOverride } = useAdminToken();

  // Override wins (needed for dev / custom domains); else auto-derive from URL.
  function resolveRepo() {
    const override = normalizeRepo(readRepoOverride());
    if (override) return { ...override, source: "override" };
    const derived = deriveRepoFromLocation();
    if (derived) return { ...derived, source: "location" };
    return null;
  }

  async function request(path, { method = "GET", body, token } = {}) {
    const authToken = token ?? readToken();
    if (!authToken) {
      const err = new Error("トークンが設定されていません");
      err.status = 401;
      throw err;
    }
    const res = await fetch(`${API_ROOT}${path}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${authToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.message || `${res.status} ${res.statusText}`);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  // Confirm the token authenticates and can push to the resolved repo.
  // Returns { login, owner, repo, source, canPush, defaultBranch }.
  async function verifyToken(token) {
    const repo = resolveRepo();
    if (!repo) {
      throw new Error(
        "リポジトリを特定できません。owner/repo を入力してください",
      );
    }
    const user = await request("/user", { token });
    const info = await request(`/repos/${repo.owner}/${repo.repo}`, { token });
    return {
      login: user.login,
      owner: repo.owner,
      repo: repo.repo,
      source: repo.source,
      canPush: !!info.permissions?.push,
      defaultBranch: info.default_branch,
    };
  }

  // Read a file. Returns { content, sha } or null if it does not exist (404).
  async function getFile(path, { ref, token } = {}) {
    const repo = resolveRepo();
    if (!repo) throw new Error("リポジトリを特定できません");
    const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
    try {
      const data = await request(
        `/repos/${repo.owner}/${repo.repo}/contents/${encodePath(path)}${query}`,
        { token },
      );
      return { content: decodeBase64(data.content), sha: data.sha };
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  }

  // Create or update a file. Pass `sha` to update an existing file.
  // Returns the new commit sha.
  async function putFile({ path, content, message, sha, branch, token } = {}) {
    const repo = resolveRepo();
    if (!repo) throw new Error("リポジトリを特定できません");
    const body = {
      message: message || `Update ${path}`,
      content: encodeBase64(content),
    };
    if (sha) body.sha = sha;
    if (branch) body.branch = branch;
    const data = await request(
      `/repos/${repo.owner}/${repo.repo}/contents/${encodePath(path)}`,
      { method: "PUT", body, token },
    );
    return data.commit?.sha;
  }

  async function getDefaultBranch(token) {
    const repo = resolveRepo();
    if (!repo) throw new Error("リポジトリを特定できません");
    const info = await request(`/repos/${repo.owner}/${repo.repo}`, { token });
    return info.default_branch;
  }

  // List a directory's entries. Returns [{ name, path, type }] ("file"|"dir"),
  // or [] if the path does not exist. Used to find orphan data/ folders.
  async function listDir(path, { token } = {}) {
    const repo = resolveRepo();
    if (!repo) throw new Error("リポジトリを特定できません");
    try {
      const data = await request(
        `/repos/${repo.owner}/${repo.repo}/contents/${encodePath(path)}`,
        { token },
      );
      if (!Array.isArray(data)) return [];
      return data.map((e) => ({ name: e.name, path: e.path, type: e.type }));
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  }

  // Atomically commit multiple files in a single commit via the Git Data API.
  // files: [{ path, content }] to add/update, or { path, delete: true } to
  // remove. Returns the new commit sha. Used so a logical change (CSV trio +
  // config.json epoch, or a deleted generation + its folder) lands as ONE
  // commit — a partial commit would deploy a broken schedule.
  async function commitFiles({ message, files, branch, token } = {}) {
    const repo = resolveRepo();
    if (!repo) throw new Error("リポジトリを特定できません");
    if (!files || files.length === 0)
      throw new Error("コミットするファイルがありません");
    const base = `/repos/${repo.owner}/${repo.repo}`;
    const targetBranch = branch || (await getDefaultBranch(token));
    const refPath = `${base}/git/refs/heads/${encodeURIComponent(targetBranch)}`;

    // 1. latest commit on the branch
    const ref = await request(
      `${base}/git/ref/heads/${encodeURIComponent(targetBranch)}`,
      { token },
    );
    const latestCommitSha = ref.object.sha;
    // 2. its tree
    const latestCommit = await request(
      `${base}/git/commits/${latestCommitSha}`,
      { token },
    );
    // 3. new tree layered on top, with inline file contents
    const newTree = await request(`${base}/git/trees`, {
      method: "POST",
      body: {
        base_tree: latestCommit.tree.sha,
        // sha:null deletes the path from the new tree; otherwise inline content
        // adds or updates it.
        tree: files.map((f) =>
          f.delete
            ? { path: f.path, mode: "100644", type: "blob", sha: null }
            : {
                path: f.path,
                mode: "100644",
                type: "blob",
                content: f.content,
              },
        ),
      },
      token,
    });
    // 4. new commit
    const commit = await request(`${base}/git/commits`, {
      method: "POST",
      body: {
        message: message || "Update via admin",
        tree: newTree.sha,
        parents: [latestCommitSha],
      },
      token,
    });
    // 5. advance the branch ref
    await request(refPath, {
      method: "PATCH",
      body: { sha: commit.sha },
      token,
    });
    return commit.sha;
  }

  return {
    resolveRepo,
    verifyToken,
    getFile,
    putFile,
    getDefaultBranch,
    listDir,
    commitFiles,
  };
}

// Encode each path segment but keep the slashes that separate them.
function encodePath(path) {
  return String(path || "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}
