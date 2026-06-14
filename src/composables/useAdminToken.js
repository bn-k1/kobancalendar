// Admin GitHub credentials — stored in localStorage only, never in the URL.
//
// This is an admin-local credential cache: a fine-grained Personal Access Token
// (PAT) and an optional repo override. It is *cache*, not canonical state — it is
// never shared, never committed, and never reflected into the canonical URL hash.
// (Contrast with useUrlParams, which owns the shareable/observable URL state.)
//
// The repo override only matters when the repo identity cannot be derived from
// window.location (local dev, or a custom-domain deployment that is not *.github.io).
// On a normal GitHub Pages URL the repo is auto-derived, so forks are zero-config.

const TOKEN_KEY = "kobancalendar.adminToken.v1";
const REPO_KEY = "kobancalendar.adminRepo.v1";

export function useAdminToken() {
  function readToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  }

  function saveToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable — nothing we can do */
    }
  }

  function clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  function hasToken() {
    return readToken().length > 0;
  }

  // Repo override: { owner, repo } or null. Accepts "owner/repo" too.
  function readRepoOverride() {
    try {
      const raw = localStorage.getItem(REPO_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.owner && parsed.repo) {
        return { owner: parsed.owner, repo: parsed.repo };
      }
      return null;
    } catch {
      return null;
    }
  }

  function saveRepoOverride(value) {
    try {
      const normalized = normalizeRepo(value);
      if (normalized) {
        localStorage.setItem(REPO_KEY, JSON.stringify(normalized));
      } else {
        localStorage.removeItem(REPO_KEY);
      }
    } catch {
      /* ignore */
    }
  }

  return {
    readToken,
    saveToken,
    clearToken,
    hasToken,
    readRepoOverride,
    saveRepoOverride,
  };
}

// Accepts { owner, repo } or "owner/repo" string; returns normalized object or null.
export function normalizeRepo(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const parts = value
      .trim()
      .replace(/^\/+|\/+$/g, "")
      .split("/");
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { owner: parts[0], repo: parts[1] };
    }
    return null;
  }
  if (value.owner && value.repo) {
    return { owner: String(value.owner), repo: String(value.repo) };
  }
  return null;
}
