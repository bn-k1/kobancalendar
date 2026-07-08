// scripts/convertCsv.js
/**
 * CSV to JSON conversion script
 *
 * Reads config/config.json, collects every distinct `data` folder referenced by
 * config.schedules, converts each folder's holiday/saturday/weekday CSVs and
 * writes a single consolidated bundle to data/scheduleData.json:
 *
 *   { "<folder>": { holiday, saturday, weekday, rotationCycleLength }, ... }
 *
 * Unlike the legacy two-folder (default/next) layout, every referenced folder
 * must contain a complete, consistent CSV set — a missing or empty folder is an
 * error, not a valid "no data" state.
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";

const require = createRequire(import.meta.url);
const fs = require("fs");
const Papa = require("papaparse");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root directory (one level up from this script)
const PROJECT_ROOT = resolve(__dirname, "..");
const CONFIG_PATH = resolve(PROJECT_ROOT, "config", "config.json");
const OUTPUT_FILE = resolve(PROJECT_ROOT, "data", "scheduleData.json");

// CSV files that make up one schedule folder
const FILES_TO_CONVERT = ["holiday", "saturday", "weekday"];

/**
 * Find genuinely-empty lines (not whitespace-only) in raw CSV text.
 *
 * Papa.parse's skipEmptyLines:true silently drops fully-empty lines, which
 * defeats the holiday/saturday/weekday equal-row-count check if the same
 * blank line happens to sit at the same position in all three files. This
 * scans the RAW text before Papa ever sees it, so the problem surfaces as a
 * clear error instead of a silent row-count coincidence.
 *
 * A single trailing "" produced by a normal end-of-file newline is not
 * flagged — only genuinely blank *lines* are. Whitespace-only lines are left
 * alone here; Papa keeps those as a 1-column row and the existing row-count
 * check already catches them.
 *
 * @param {string} csvContent - raw file content
 * @returns {number[]} 1-indexed line numbers of blank lines (empty if none)
 */
export function findBlankLines(csvContent) {
  const normalized = csvContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  // Drop the single trailing "" artifact from a normal final newline — it is
  // not a blank *line* in the file, just how a newline-terminated file splits.
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  const blankLineNumbers = [];
  lines.forEach((line, idx) => {
    if (line === "") {
      blankLineNumbers.push(idx + 1);
    }
  });
  return blankLineNumbers;
}

/**
 * Scan `parentDir` for a directory whose name matches `name` case-insensitively
 * but not exactly. Used to give a clear error when config references a folder
 * name that only resolves on a case-insensitive filesystem (macOS/Windows dev
 * machines) but would fail on Linux CI.
 * @param {string} parentDir
 * @param {string} name
 * @returns {string|null} the actual on-disk directory name, or null if none
 */
export function findCaseInsensitiveMatch(parentDir, name) {
  let entries;
  try {
    entries = fs
      .readdirSync(parentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return null;
  }
  const lower = name.toLowerCase();
  return (
    entries.find((entry) => entry !== name && entry.toLowerCase() === lower) ||
    null
  );
}

/**
 * Parse CSV content into an array of optimized schedule objects
 * Uses shortened property names: s (subject), sT (startTime), eT (endTime)
 * Omits empty startTime and endTime to reduce bundle size
 * @param {string} csvData - CSV content as a string
 * @returns {Object[]} Array of parsed schedule objects
 */
export function parseCSVToScheduleObjects(csvData) {
  const result = Papa.parse(csvData, {
    skipEmptyLines: true,
    dynamicTyping: false,
    header: false,
  });

  if (result.errors && result.errors.length > 0) {
    throw new Error(`CSV parse error: ${JSON.stringify(result.errors)}`);
  }

  // Convert each row to an optimized object with shortened property names
  return result.data.map((row) => {
    const scheduleItem = {
      s: (row[0] || "").trim(), // subject -> s
    };

    // Only include startTime (sT) and endTime (eT) if they have values
    if (row[1] && row[1].trim()) {
      scheduleItem.sT = row[1].trim(); // startTime -> sT
    }
    if (row[2] && row[2].trim()) {
      scheduleItem.eT = row[2].trim(); // endTime -> eT
    }

    return scheduleItem;
  });
}

/**
 * Read and parse config/config.json.
 * @returns {Object} parsed config
 */
function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found: ${CONFIG_PATH}`);
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (err) {
    throw new Error(`Failed to parse config.json: ${err.message}`, {
      cause: err,
    });
  }
}

/**
 * Normalize config.schedules into resolved epochs.
 *
 * `data` may be:
 *  - a string — a single folder for the whole epoch;
 *  - omitted (except on the first epoch) — inherited from the preceding epoch's
 *    last folder (a "position shift only" migration written as just `{ from }`);
 *  - an array of `{ data, from? }` — the `schedule_update`-equivalent in-epoch
 *    table swap, where several folders are used at different dates within the
 *    same epoch. Every folder named is converted. The first array segment is
 *    pinned to the epoch's own `from`; later segments must specify their own.
 *
 * The first epoch must specify `data`.
 *
 * Mirrors the normalization rules of buildEpochs() in
 * src/composables/useAppInitializer.js (kept independent — see
 * validateEpochStructure below for why the browser code isn't imported here).
 *
 * @param {Object} config - parsed config.json
 * @returns {Array<{from: string, data: string, dataKeys: string[], segments: Array<{from: string, data: string}>}>}
 *   resolved epochs in config order. `data` is the representative (first)
 *   folder; `dataKeys` lists every distinct folder the epoch references;
 *   `segments` lists every in-epoch data segment with its own `from`.
 */
export function resolveEpochs(config) {
  if (!Array.isArray(config.schedules) || config.schedules.length === 0) {
    throw new Error(
      "config.schedules must be a non-empty array of { from, data } epochs.",
    );
  }

  const resolved = [];
  for (let i = 0; i < config.schedules.length; i += 1) {
    const epoch = config.schedules[i];
    if (!epoch || typeof epoch !== "object") {
      throw new Error(
        `config.schedules[${i}] must be an object. Got: ${JSON.stringify(epoch)}`,
      );
    }
    if (typeof epoch.from !== "string" || !epoch.from) {
      throw new Error(
        `config.schedules[${i}].from must be a non-empty string. Got: ${JSON.stringify(
          epoch.from,
        )}`,
      );
    }

    let segments;
    if (Array.isArray(epoch.data)) {
      if (epoch.data.length === 0) {
        throw new Error(`config.schedules[${i}].data array must not be empty.`);
      }
      segments = epoch.data.map((seg, si) => {
        const name = seg && seg.data;
        if (typeof name !== "string" || !name) {
          throw new Error(
            `config.schedules[${i}].data[${si}] must specify a non-empty "data" ` +
              `folder name. Got: ${JSON.stringify(seg)}`,
          );
        }
        // First segment is pinned to the epoch's own `from`; later segments
        // must specify their own (mirrors useAppInitializer's resolveSegments).
        let segFrom = epoch.from;
        if (si > 0) {
          segFrom = seg && seg.from;
          if (typeof segFrom !== "string" || !segFrom) {
            throw new Error(
              `config.schedules[${i}].data[${si}] must specify a non-empty "from" ` +
                `(only the first in-epoch segment inherits the epoch's from). ` +
                `Got: ${JSON.stringify(seg)}`,
            );
          }
        }
        return { from: segFrom, data: name };
      });
    } else if (typeof epoch.data === "string" && epoch.data) {
      segments = [{ from: epoch.from, data: epoch.data }];
    } else {
      if (i === 0) {
        throw new Error(
          `config.schedules[0] must specify a non-empty "data" folder name ` +
            `(the first epoch cannot inherit). Got: ${JSON.stringify(epoch)}`,
        );
      }
      // Inherit from the previous resolved epoch's last segment.
      const prevSegments = resolved[i - 1].segments;
      const inherited = prevSegments[prevSegments.length - 1].data;
      segments = [{ from: epoch.from, data: inherited }];
    }

    const dataKeys = [];
    for (const seg of segments) {
      if (!dataKeys.includes(seg.data)) dataKeys.push(seg.data);
    }

    resolved.push({
      from: epoch.from,
      data: segments[0].data,
      dataKeys,
      segments,
    });
  }
  return resolved;
}

/**
 * Validate the structural rules that buildEpochs() (in
 * src/composables/useAppInitializer.js) enforces client-side, so a malformed
 * config fails the build here instead of only failing at runtime in the
 * browser. Mirrors these rules/error semantics exactly:
 *  - epoch `from` must be ascending and unique across config.schedules;
 *  - in-epoch data segments must have strictly ascending `from`;
 *  - in-epoch data segments must fall before the next epoch's `from`;
 *  - every in-epoch data segment must share the same rotationCycleLength
 *    (an in-epoch data swap must not shift the rotation phase).
 *
 * `from` values are plain "YYYY-MM-DD" strings; that format sorts
 * lexicographically the same as chronologically, so no date library is
 * needed here (useAppInitializer.js is a Vue/Pinia composable chain and does
 * not import cleanly into a plain Node script).
 *
 * @param {Array<{from: string, data: string, dataKeys: string[], segments: Array<{from: string, data: string}>}>} epochs
 * @param {Object} bundle - converted schedule data, keyed by folder name
 */
export function validateEpochStructure(epochs, bundle) {
  // Segment-internal checks (ascending `from`, matching rotationCycleLength),
  // one epoch at a time.
  for (let i = 0; i < epochs.length; i += 1) {
    const { segments } = epochs[i];

    for (let si = 1; si < segments.length; si += 1) {
      if (segments[si].from <= segments[si - 1].from) {
        throw new Error(
          `config.schedules[${i}] の data セグメント from は昇順である必要があります` +
            `（${segments[si - 1].from} の後に ${segments[si].from} が来ています）`,
        );
      }
    }

    const cycle0 = bundle[segments[0].data]?.rotationCycleLength;
    for (const seg of segments) {
      const cycle = bundle[seg.data]?.rotationCycleLength;
      if (cycle !== cycle0) {
        throw new Error(
          `config.schedules[${i}] の data セグメントはサイクル長が一致する必要があります` +
            `（${segments[0].data}=${cycle0}, ${seg.data}=${cycle}）。` +
            `epoch 内データ切替は回転位相を維持するため同一サイクル長が必須です。`,
        );
      }
    }
  }

  // Top-level epoch `from` must be ascending and unique (config order is
  // trusted, never silently sorted — that would hide a typo).
  for (let i = 1; i < epochs.length; i += 1) {
    const prev = epochs[i - 1].from;
    const curr = epochs[i].from;
    if (curr === prev) {
      throw new Error(`config.schedules の from が重複しています: ${curr}`);
    }
    if (curr < prev) {
      throw new Error(
        `config.schedules の from は昇順である必要があります: ${prev} の後に ${curr} が来ています`,
      );
    }
  }

  // In-epoch segments must stay inside the epoch's display window (before
  // the next epoch's `from`).
  for (let i = 0; i < epochs.length; i += 1) {
    const nextFrom = epochs[i + 1]?.from;
    if (!nextFrom) continue;
    for (const seg of epochs[i].segments) {
      if (seg.from >= nextFrom) {
        throw new Error(
          `config.schedules[${i}] の data セグメント ${seg.from} が次世代の from ${nextFrom} 以降です`,
        );
      }
    }
  }
}

/**
 * Read the schedule folder names referenced by config.schedules.
 * @param {Array<{from: string, data: string, dataKeys: string[]}>} epochs
 * @returns {string[]} Distinct, deterministically ordered folder names
 */
function readReferencedFolders(epochs) {
  const folders = [];
  for (const epoch of epochs) {
    for (const name of epoch.dataKeys) {
      if (!folders.includes(name)) {
        folders.push(name);
      }
    }
  }
  return folders;
}

/**
 * Emit (console.warn) cleanup hints for the admin. Never deletes anything —
 * past epochs still serve as the baseline for migration alerts.
 *
 * Two kinds of hints:
 *  1. Epochs two or more generations older than the "current" epoch
 *     (the latest epoch whose `from` is on or before today).
 *  2. Folders under data/ that no config.schedules[].data references.
 *
 * @param {Array<{from: string, data: string}>} epochs - resolved epochs
 * @param {string[]} referencedFolders - distinct referenced folder names
 */
function warnStaleArtifacts(epochs, referencedFolders) {
  // --- 1. 古い世代 ---
  const todayStr = new Date().toISOString().slice(0, 10);
  // from 昇順で並べた上で current epoch（from <= today の最後）を求める
  const sorted = [...epochs].sort((a, b) => (a.from < b.from ? -1 : 1));
  let currentIndex = 0;
  for (let i = 0; i < sorted.length; i += 1) {
    if (sorted[i].from <= todayStr) currentIndex = i;
    else break;
  }
  const staleEpochs = sorted.slice(0, Math.max(0, currentIndex - 1));
  if (staleEpochs.length > 0) {
    console.warn(
      `\n⚠️  整理候補の世代: current epoch より 2 世代以上前の世代があります ` +
        `(削除はされません。移行アラートの基準として残せます):`,
    );
    for (const epoch of staleEpochs) {
      console.warn(`   - ${epoch.from} (data: ${epoch.data})`);
    }
  }

  // --- 2. 未参照の data/ フォルダ ---
  const dataDir = resolve(PROJECT_ROOT, "data");
  let entries;
  try {
    entries = fs
      .readdirSync(dataDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    entries = [];
  }
  // menu は CSV スケジュールではないので除外
  const orphanFolders = entries.filter(
    (name) => name !== "menu" && !referencedFolders.includes(name),
  );
  if (orphanFolders.length > 0) {
    console.warn(
      `\n⚠️  整理候補のフォルダ: どの config.schedules[].data からも参照されていない ` +
        `data/ 配下のフォルダがあります (削除はされません):`,
    );
    for (const name of orphanFolders) {
      console.warn(`   - data/${name}/`);
    }
  }
}

/**
 * Convert a single schedule folder into a validated schedule data object.
 * @param {string} folderName - Folder under data/ (e.g. "default")
 * @returns {Object} { holiday, saturday, weekday, rotationCycleLength }
 */
function convertFolder(folderName) {
  const inputDir = resolve(PROJECT_ROOT, "data", folderName);
  console.log(`\nProcessing folder: ${inputDir}`);

  if (!fs.existsSync(inputDir)) {
    const dataDir = resolve(PROJECT_ROOT, "data");
    const caseMatch = findCaseInsensitiveMatch(dataDir, folderName);
    if (caseMatch) {
      throw new Error(
        `config references "${folderName}" but the directory on disk is ` +
          `"${caseMatch}" — this build would fail on Linux CI (folder lookup ` +
          `is case-sensitive there). Fix config.json to use "${caseMatch}".`,
      );
    }
    throw new Error(
      `Schedule folder referenced by config.schedules does not exist: ${inputDir}`,
    );
  }

  const scheduleData = {
    holiday: [],
    saturday: [],
    weekday: [],
    rotationCycleLength: 0,
  };

  for (const filename of FILES_TO_CONVERT) {
    const csvPath = join(inputDir, `${filename}.csv`);
    if (!fs.existsSync(csvPath)) {
      throw new Error(
        `Missing CSV in '${folderName}': ${csvPath}. ` +
          `holiday/saturday/weekday must all exist.`,
      );
    }
    const csvContent = fs.readFileSync(csvPath, "utf8");

    const blankLines = findBlankLines(csvContent);
    if (blankLines.length > 0) {
      throw new Error(
        `Blank line(s) in ${csvPath} at line ${blankLines.join(", ")}. ` +
          `Papa.parse's skipEmptyLines would silently drop these, which can hide ` +
          `a row-count mismatch between holiday/saturday/weekday. Remove the blank line(s).`,
      );
    }

    scheduleData[filename] = parseCSVToScheduleObjects(csvContent);
    console.log(
      `✓ Parsed ${filename}.csv (${scheduleData[filename].length} entries)`,
    );
  }

  const { holiday, saturday, weekday } = scheduleData;
  if (!holiday.length || !saturday.length || !weekday.length) {
    throw new Error(
      `Empty CSV set in '${folderName}': holiday/saturday/weekday must all have rows.`,
    );
  }
  if (saturday.length !== holiday.length || weekday.length !== holiday.length) {
    throw new Error(
      `Row-count mismatch in '${folderName}': holiday=${holiday.length}, ` +
        `saturday=${saturday.length}, weekday=${weekday.length}. ` +
        `All three must have identical row counts.`,
    );
  }

  scheduleData.rotationCycleLength = holiday.length;
  console.log(
    `✓ Validation passed. Rotation cycle length: ${scheduleData.rotationCycleLength}`,
  );
  return scheduleData;
}

function main() {
  const config = readConfig();
  const epochs = resolveEpochs(config);
  const folders = readReferencedFolders(epochs);
  console.log(`Folders referenced by config.schedules: ${folders.join(", ")}`);

  const bundle = {};
  for (const folder of folders) {
    bundle[folder] = convertFolder(folder);
  }

  // Structural config validation (ascending/unique from, segment ordering,
  // matching rotationCycleLength) — same rules buildEpochs() enforces in the
  // browser, now also enforced at build time.
  validateEpochStructure(epochs, bundle);

  // Ensure output directory exists
  const outputDir = dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write JSON without formatting (minified)
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bundle));
  console.log(`\n✓ ${OUTPUT_FILE} created successfully.`);
  for (const folder of folders) {
    console.log(
      `  - ${folder}: cycle length ${bundle[folder].rotationCycleLength}`,
    );
  }

  // 整理候補（古い世代・未参照フォルダ）を管理者に通知（削除はしない）
  warnStaleArtifacts(epochs, folders);
}

// Only run the CLI when this file is executed directly (`node
// scripts/convertCsv.js`), not when imported (e.g. by tests) for its pure
// helper functions.
const isMainModule =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  console.log("CSV to JSON Conversion");
  console.log("========================================");
  try {
    main();
    console.log("\n✅ CSV to JSON conversion complete!");
  } catch (error) {
    console.error("\n❌ CSV to JSON conversion failed:", error.message);
    process.exit(1);
  }
}
