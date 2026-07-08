// Pure helpers for the admin cafeteria-menu editor.
//
// Source of truth for the menu is data/menu/YYYY-MM-{a,b}.txt — one dish per
// line, line N = day N of that month (blank line = no menu that day). The
// generated data/menu/menu.json is a build artifact (convertMenu.js), never
// edited directly. These helpers mirror convertMenu's readLines parsing so the
// browser editor round-trips the exact same text format.

export const MENU_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// A menu source filename -> { key: "YYYY-MM", type: "a"|"b" }, or null.
export function parseMenuFilename(filename) {
  const m = String(filename || "").match(/^(\d{4}-\d{2})-(a|b)\.txt$/i);
  if (!m) return null;
  return { key: m[1], type: m[2].toLowerCase() };
}

export function menuFilePath(monthKey, type) {
  return `data/menu/${monthKey}-${type}.txt`;
}

export function daysInMonth(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

// Split a .txt into trimmed per-day lines, dropping trailing blank lines — the
// same normalization convertMenu.js applies when reading these files.
export function parseMenuText(text) {
  const lines = String(text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim());
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

// Turn an array of daily dishes back into file text: trim trailing empties so a
// half-filled month stays short, and terminate with a newline when non-empty.
export function serializeMenuText(dishes) {
  const lines = (dishes || []).map((d) => String(d ?? "").trim());
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines.length ? lines.join("\n") + "\n" : "";
}

// "2026-07" -> "2026年7月"
export function monthLabel(monthKey) {
  const [y, m] = monthKey.split("-");
  return `${Number(y)}年${Number(m)}月`;
}
