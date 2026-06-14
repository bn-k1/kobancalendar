// src/__tests__/composables/useAdminToken.test.js
// Characterization tests for the admin credential storage composable.
import { describe, it, expect } from "vitest";
import { useAdminToken, normalizeRepo } from "@/composables/useAdminToken";

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
