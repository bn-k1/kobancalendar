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

console.log("CSV to JSON Conversion");
console.log("========================================");

// Project root directory (one level up from this script)
const PROJECT_ROOT = resolve(__dirname, "..");
const CONFIG_PATH = resolve(PROJECT_ROOT, "config", "config.json");
const OUTPUT_FILE = resolve(PROJECT_ROOT, "data", "scheduleData.json");

// CSV files that make up one schedule folder
const FILES_TO_CONVERT = ["holiday", "saturday", "weekday"];

/**
 * Parse CSV content into an array of optimized schedule objects
 * Uses shortened property names: s (subject), sT (startTime), eT (endTime)
 * Omits empty startTime and endTime to reduce bundle size
 * @param {string} csvData - CSV content as a string
 * @returns {Object[]} Array of parsed schedule objects
 */
function parseCSVToScheduleObjects(csvData) {
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
      s: row[0] || "", // subject -> s
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
 * `data` may be omitted on any epoch except the first — in that case it is
 * inherited from the preceding epoch (a "position shift only" migration written
 * as just `{ from }`). The first epoch must specify `data`.
 *
 * @param {Object} config - parsed config.json
 * @returns {Array<{from: string, data: string}>} resolved epochs in config order
 */
function resolveEpochs(config) {
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
    let data = epoch.data;
    if (typeof data !== "string" || !data) {
      if (i === 0) {
        throw new Error(
          `config.schedules[0] must specify a non-empty "data" folder name ` +
            `(the first epoch cannot inherit). Got: ${JSON.stringify(epoch)}`,
        );
      }
      // 直前の解決済み世代から data を継承
      data = resolved[i - 1].data;
    }
    resolved.push({ from: epoch.from, data });
  }
  return resolved;
}

/**
 * Read the schedule folder names referenced by config.schedules.
 * @param {Array<{from: string, data: string}>} epochs - resolved epochs
 * @returns {string[]} Distinct, deterministically ordered folder names
 */
function readReferencedFolders(epochs) {
  const folders = [];
  for (const epoch of epochs) {
    if (!folders.includes(epoch.data)) {
      folders.push(epoch.data);
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

try {
  main();
  console.log("\n✅ CSV to JSON conversion complete!");
} catch (error) {
  console.error("\n❌ CSV to JSON conversion failed:", error.message);
  process.exit(1);
}
