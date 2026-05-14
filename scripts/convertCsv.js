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
 * Read the schedule folder names referenced by config.schedules.
 * @returns {string[]} Distinct, deterministically ordered folder names
 */
function readReferencedFolders() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found: ${CONFIG_PATH}`);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (err) {
    throw new Error(`Failed to parse config.json: ${err.message}`, {
      cause: err,
    });
  }

  if (!Array.isArray(config.schedules) || config.schedules.length === 0) {
    throw new Error(
      "config.schedules must be a non-empty array of { from, data } epochs.",
    );
  }

  const folders = [];
  for (const epoch of config.schedules) {
    if (!epoch || typeof epoch.data !== "string" || !epoch.data) {
      throw new Error(
        `Every config.schedules entry needs a non-empty "data" folder name. Got: ${JSON.stringify(
          epoch,
        )}`,
      );
    }
    if (!folders.includes(epoch.data)) {
      folders.push(epoch.data);
    }
  }
  return folders;
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
  const folders = readReferencedFolders();
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
}

try {
  main();
  console.log("\n✅ CSV to JSON conversion complete!");
} catch (error) {
  console.error("\n❌ CSV to JSON conversion failed:", error.message);
  process.exit(1);
}
