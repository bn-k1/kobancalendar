// src/utils/escapeHtml.js
// Escape untrusted strings before interpolating them into a raw HTML template
// (e.g. FullCalendar's eventContent `html:` option, which assigns innerHTML).

/**
 * Escape HTML metacharacters (& < > " ') in a value, coercing it to a string
 * first. Order matters: & must be escaped before the entities it introduces.
 */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
