// scripts/convertMenu.js
/**
 * Convert monthly cafeteria menu text files into date-keyed JSON.
 *
 * Input files: data/menu/YYYY-MM-a.txt and data/menu/YYYY-MM-b.txt
 * Output file: data/menu/menu.json
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const require = createRequire(import.meta.url);
const fs = require("fs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");
const MENU_DIR = resolve(PROJECT_ROOT, "data", "menu");
const OUTPUT_FILE = join(MENU_DIR, "menu.json");

const FILENAME_RE = /^(\d{4})-(\d{2})-(a|b)\.txt$/i;

/**
 * Parse a menu filename into { year, month, type, key }.
 *
 * Returns null for filenames that don't match the expected shape at all
 * (caller decides whether that's a warning or an error). Throws if the month
 * digits are present but out of the valid 01-12 range — that's not "not a
 * menu file", it's a typo in an otherwise-valid-looking menu filename.
 *
 * @param {string} filename
 * @returns {{year: number, month: number, type: string, key: string}|null}
 */
export function parseFilename(filename) {
  const match = filename.match(FILENAME_RE);
  if (!match) return null;

  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new Error(
      `Invalid menu filename "${filename}": month "${match[2]}" is out of range ` +
        `(must be 01-12).`,
    );
  }

  return {
    year: Number(match[1]),
    month,
    type: match[3].toLowerCase(),
    key: `${match[1]}-${match[2]}`,
  };
}

/**
 * Number of days in a given year/month (month is 1-indexed).
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * Read a menu text file into an array of trimmed lines, with trailing blank
 * lines stripped. Line N (1-indexed) corresponds to day N of the month.
 * @param {string} filePath
 * @returns {string[]}
 */
export function readLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim());

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines;
}

/**
 * Guard: menu lines are strictly positional (line N = day N), so a file must
 * never have MORE lines than the month has days. Fewer lines is the normal
 * "not filled in yet" state and must not raise or warn.
 * @param {string[]} lines
 * @param {number} dim - days in the month
 * @param {string} filename - for the error message
 */
export function assertLineCountWithinMonth(lines, dim, filename) {
  if (lines.length > dim) {
    throw new Error(
      `Menu file "${filename}" has ${lines.length} lines but its month only has ` +
        `${dim} days (expected at most ${dim}). Menu lines are positional ` +
        `(line N = day N) — a file must not have more lines than the month has days.`,
    );
  }
}

/**
 * Group menu filenames into per-month { year, month, a, b } buckets, where
 * `a`/`b` hold the *source filename* assigned to that slot (not the file's
 * contents — reading happens separately).
 *
 * Throws if two files map to the same {year, month, type} bucket. This can
 * happen because `type` is lower-cased when read (e.g. "2026-07-A.txt" and
 * "2026-07-a.txt" would otherwise silently collide, with the later one in
 * directory-listing order winning).
 *
 * @param {string[]} filenames
 * @param {(filename: string) => void} [onSkip] - called for filenames that
 *   don't match the expected menu filename shape at all.
 * @returns {Object<string, {year: number, month: number, a: string|null, b: string|null}>}
 */
export function groupMenuFilenames(filenames, onSkip) {
  const buckets = {};

  for (const filename of filenames) {
    const parsed = parseFilename(filename);
    if (!parsed) {
      if (onSkip) onSkip(filename);
      continue;
    }

    if (!buckets[parsed.key]) {
      buckets[parsed.key] = {
        year: parsed.year,
        month: parsed.month,
        a: null,
        b: null,
      };
    }

    const bucket = buckets[parsed.key];
    if (bucket[parsed.type]) {
      throw new Error(
        `Menu files "${bucket[parsed.type]}" and "${filename}" both map to the ` +
          `same ${parsed.key} "${parsed.type}" slot (the a/b type is ` +
          `case-insensitive). Rename one of them.`,
      );
    }
    bucket[parsed.type] = filename;
  }

  return buckets;
}

function buildMenuJson() {
  if (!fs.existsSync(MENU_DIR)) {
    fs.mkdirSync(MENU_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(MENU_DIR)
    .filter((filename) => /\.txt$/i.test(filename));

  const buckets = groupMenuFilenames(files, (filename) => {
    console.warn(`Skipping unmatched file: ${filename}`);
  });

  const result = {};

  Object.values(buckets)
    .sort((m1, m2) => {
      if (m1.year !== m2.year) return m1.year - m2.year;
      return m1.month - m2.month;
    })
    .forEach((bucket) => {
      const { year, month, a: aFile, b: bFile } = bucket;
      const dim = daysInMonth(year, month);

      if (!aFile && !bFile) {
        return;
      }

      const aLines = aFile ? readLines(join(MENU_DIR, aFile)) : null;
      const bLines = bFile ? readLines(join(MENU_DIR, bFile)) : null;

      if (aFile) assertLineCountWithinMonth(aLines, dim, aFile);
      if (bFile) assertLineCountWithinMonth(bLines, dim, bFile);

      for (let day = 1; day <= dim; day += 1) {
        const aMenu = aLines?.[day - 1] ?? "";
        const bMenu = bLines?.[day - 1] ?? "";

        if (!aMenu && !bMenu) {
          continue;
        }

        const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        result[dateKey] = {
          a: aMenu,
          b: bMenu,
        };
      }
    });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result));
  console.log(`✓ menu.json created: ${OUTPUT_FILE}`);
  console.log(`  - Registered dates: ${Object.keys(result).length}`);
}

// Only run the CLI when this file is executed directly (`node
// scripts/convertMenu.js`), not when imported (e.g. by tests) for its pure
// helper functions.
const isMainModule =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  console.log("Menu Text to JSON Conversion");
  console.log("========================================");
  try {
    buildMenuJson();
    console.log("\n✅ Menu conversion complete!");
  } catch (error) {
    console.error("Menu conversion failed:", error);
    process.exit(1);
  }
}
