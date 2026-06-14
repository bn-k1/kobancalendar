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

  return { resolveRepo, verifyToken, getFile, putFile };
}

// Encode each path segment but keep the slashes that separate them.
function encodePath(path) {
  return String(path || "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}
