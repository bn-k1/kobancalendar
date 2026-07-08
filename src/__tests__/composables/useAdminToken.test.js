// src/__tests__/composables/useAdminToken.test.js
// Characterization tests for the admin credential storage composable.
import { describe, it, expect, afterEach } from "vitest";
import { useAdminToken, normalizeRepo } from "@/composables/useAdminToken";
import { makeStorageFail, restoreStorage } from "../setup";

// ---------- token ----------

describe("useAdminToken() — token", () => {
  it("保存したトークンを読み出せる", () => {
    const { saveToken, readToken } = useAdminToken();
    saveToken("github_pat_abc");
    expect(readToken()).toBe("github_pat_abc");
  });

  it("初期状態では空文字を返す", () => {
    const { readToken } = useAdminToken();
    expect(readToken()).toBe("");
  });

  it("空トークンの保存は削除として扱う", () => {
    const { saveToken, readToken } = useAdminToken();
    saveToken("x");
    saveToken("");
    expect(readToken()).toBe("");
  });

  it("clearToken でトークンを消せる", () => {
    const { saveToken, clearToken, readToken, hasToken } = useAdminToken();
    saveToken("token");
    expect(hasToken()).toBe(true);
    clearToken();
    expect(readToken()).toBe("");
    expect(hasToken()).toBe(false);
  });
});

// ---------- repo override ----------

describe("useAdminToken() — repo override", () => {
  it("owner/repo オブジェクトを保存・復元できる", () => {
    const { saveRepoOverride, readRepoOverride } = useAdminToken();
    saveRepoOverride({ owner: "bn-k1", repo: "kobancalendar" });
    expect(readRepoOverride()).toEqual({
      owner: "bn-k1",
      repo: "kobancalendar",
    });
  });

  it('"owner/repo" 文字列も受け付ける', () => {
    const { saveRepoOverride, readRepoOverride } = useAdminToken();
    saveRepoOverride("foo/bar");
    expect(readRepoOverride()).toEqual({ owner: "foo", repo: "bar" });
  });

  it("null/不正値の保存は削除になる", () => {
    const { saveRepoOverride, readRepoOverride } = useAdminToken();
    saveRepoOverride("foo/bar");
    saveRepoOverride(null);
    expect(readRepoOverride()).toBeNull();
  });

  it("未設定なら null を返す", () => {
    const { readRepoOverride } = useAdminToken();
    expect(readRepoOverride()).toBeNull();
  });
});

// ---------- normalizeRepo ----------

describe("normalizeRepo()", () => {
  it("正常な文字列を分解する", () => {
    expect(normalizeRepo("a/b")).toEqual({ owner: "a", repo: "b" });
  });

  it("前後スラッシュを除去する", () => {
    expect(normalizeRepo("/a/b/")).toEqual({ owner: "a", repo: "b" });
  });

  it("セグメント不足は null", () => {
    expect(normalizeRepo("justone")).toBeNull();
    expect(normalizeRepo("a/b/c")).toBeNull();
    expect(normalizeRepo("")).toBeNull();
    expect(normalizeRepo(null)).toBeNull();
  });
});

// Every method here wraps its localStorage call in try/catch with no
// re-throw (Safari private-mode / QuotaExceededError survival). These tests
// exercise those catch branches directly and assert exactly what they
// promise: no throw, and the documented safe fallback value.
describe("useAdminToken() — storage failure fallback (Safari private mode)", () => {
  afterEach(() => {
    restoreStorage();
  });

  it("readToken: getItem が失敗しても例外を投げず空文字を返す", () => {
    const { readToken } = useAdminToken();
    makeStorageFail("getItem");
    let result;
    expect(() => {
      result = readToken();
    }).not.toThrow();
    expect(result).toBe("");
  });

  it("saveToken: setItem が失敗しても例外を投げない", () => {
    const { saveToken } = useAdminToken();
    makeStorageFail("setItem");
    expect(() => saveToken("token")).not.toThrow();
  });

  it("clearToken: removeItem が失敗しても例外を投げない", () => {
    const { clearToken } = useAdminToken();
    makeStorageFail("removeItem");
    expect(() => clearToken()).not.toThrow();
  });

  it("readRepoOverride: getItem が失敗しても例外を投げず null を返す", () => {
    const { readRepoOverride } = useAdminToken();
    makeStorageFail("getItem");
    let result;
    expect(() => {
      result = readRepoOverride();
    }).not.toThrow();
    expect(result).toBeNull();
  });

  it("saveRepoOverride: setItem が失敗しても例外を投げない", () => {
    const { saveRepoOverride } = useAdminToken();
    makeStorageFail("setItem");
    expect(() => saveRepoOverride({ owner: "a", repo: "b" })).not.toThrow();
  });
});
