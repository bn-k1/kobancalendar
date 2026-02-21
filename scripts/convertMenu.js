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

console.log("Menu Text to JSON Conversion");
console.log("========================================");

function parseFilename(filename) {
  const match = filename.match(/^(\d{4})-(\d{2})-(a|b)\.txt$/i);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    type: match[3].toLowerCase(),
    key: `${match[1]}-${match[2]}`,
  };
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function readLines(filePath) {
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

function buildMenuJson() {
  if (!fs.existsSync(MENU_DIR)) {
    fs.mkdirSync(MENU_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(MENU_DIR)
    .filter((filename) => /\.txt$/i.test(filename));

  const monthBuckets = {};

  files.forEach((filename) => {
    const parsed = parseFilename(filename);
    if (!parsed) {
      console.warn(`Skipping unmatched file: ${filename}`);
      return;
    }

    if (!monthBuckets[parsed.key]) {
      monthBuckets[parsed.key] = {
        year: parsed.year,
        month: parsed.month,
        a: null,
        b: null,
      };
    }

    const filePath = join(MENU_DIR, filename);
    monthBuckets[parsed.key][parsed.type] = readLines(filePath);
  });

  const result = {};

  Object.values(monthBuckets)
    .sort((m1, m2) => {
      if (m1.year !== m2.year) return m1.year - m2.year;
      return m1.month - m2.month;
    })
    .forEach((monthData) => {
      const { year, month, a, b } = monthData;
      const dim = daysInMonth(year, month);

      if (!a && !b) {
        return;
      }

      for (let day = 1; day <= dim; day += 1) {
        const aMenu = a?.[day - 1] ?? "";
        const bMenu = b?.[day - 1] ?? "";

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

try {
  buildMenuJson();
  console.log("\n✅ Menu conversion complete!");
} catch (error) {
  console.error("Menu conversion failed:", error);
  process.exit(1);
}
