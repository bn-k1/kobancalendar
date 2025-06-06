// scripts/csv-to-json.js
/**
 * CSV to JSON conversion script - Modified Version
 *
 * This script converts CSV files to consolidated JSON format for two data sets (default and next).
 * Each dataset outputs a single JSON file containing holiday, saturday, and weekday data.
 * Includes validation and error handling for mismatched row counts or missing files.
 * Output: Minified JSON with shortened property names (s, sT, eT)
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const require = createRequire(import.meta.url);
const fs = require('fs');
const Papa = require('papaparse');

// Determine this script's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('CSV to JSON Conversion');
console.log('========================================');

// Project root directory (one level up from this script)
const PROJECT_ROOT = resolve(__dirname, '..');

// Data sets and files to convert
const TARGET_DIRS = ['default', 'next'];
const FILES_TO_CONVERT = ['holiday', 'saturday', 'weekday'];

/**
 * Parse CSV content into an array of optimized schedule objects
 * Uses shortened property names: s (subject), sT (startTime), eT (endTime)
 * Omits empty startTime and endTime to reduce bundle size
 * @param {string} csvData - CSV content as a string
 * @returns {Object[]} Array of parsed schedule objects
 */
function parseCSVToScheduleObjects(csvData) {
  try {
    const result = Papa.parse(csvData, {
      skipEmptyLines: true,
      dynamicTyping: false,
      header: false,
    });

    if (result.errors && result.errors.length > 0) {
      console.error('CSV Parse Error:', result.errors);
      return [];
    }

    // Convert each row to an optimized object with shortened property names
    return result.data.map(row => {
      const scheduleItem = {
        s: row[0] || '' // subject -> s
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
  } catch (error) {
    console.error('Error parsing CSV data:', error);
    return [];
  }
}

/**
 * Validate that all schedule arrays have the same length
 * @param {Object} scheduleData - Object containing holiday, saturday, weekday arrays
 * @returns {boolean} True if all arrays have same length, false otherwise
 */
function validateScheduleData(scheduleData) {
  const { holiday, saturday, weekday } = scheduleData;
  
  if (!holiday.length || !saturday.length || !weekday.length) {
    return false;
  }
  
  const holidayLength = holiday.length;
  return saturday.length === holidayLength && weekday.length === holidayLength;
}

/**
 * Create empty schedule data structure
 * @returns {Object} Empty schedule data with rotationCycleLength of 0
 */
function createEmptyScheduleData() {
  return {
    holiday: [],
    saturday: [],
    weekday: [],
    rotationCycleLength: 0
  };
}

/**
 * Process a single directory (default or next)
 * @param {string} dirName - Directory name ('default' or 'next')
 */
function processDirectory(dirName) {
  const inputDir = resolve(PROJECT_ROOT, 'data', dirName);
  const outputFile = resolve(inputDir, `${dirName}.json`);

  console.log(`\nProcessing directory: ${inputDir}`);
  console.log(`Output file: ${outputFile}`);

  const scheduleData = {
    holiday: [],
    saturday: [],
    weekday: [],
    rotationCycleLength: 0
  };

  let hasValidData = true;

  // Process each CSV file
  for (const filename of FILES_TO_CONVERT) {
    const csvPath = join(inputDir, `${filename}.csv`);
    
    console.log(`Processing ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      console.warn(`File not found: ${csvPath}. Marking data as invalid.`);
      hasValidData = false;
      break;
    }

    try {
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const parsedData = parseCSVToScheduleObjects(csvContent);
      scheduleData[filename] = parsedData;
      
      console.log(`✓ Parsed ${filename}.csv (${parsedData.length} entries)`);
    } catch (err) {
      console.error(`Error reading or parsing ${csvPath}:`, err);
      hasValidData = false;
      break;
    }
  }

  // Validate data consistency
  if (hasValidData && validateScheduleData(scheduleData)) {
    scheduleData.rotationCycleLength = scheduleData.holiday.length;
    console.log(`✓ Validation passed. Rotation cycle length: ${scheduleData.rotationCycleLength}`);
  } else {
    console.warn(`⚠ Validation failed or missing files. Creating empty schedule data.`);
    Object.assign(scheduleData, createEmptyScheduleData());
  }

  // Write consolidated JSON file (minified - no formatting)
  try {
    // Ensure directory exists
    const outputDir = dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON without formatting (minified)
    fs.writeFileSync(outputFile, JSON.stringify(scheduleData));
    console.log(`✓ ${dirName}.json created successfully.`);
    console.log(`  - Holiday entries: ${scheduleData.holiday.length}`);
    console.log(`  - Saturday entries: ${scheduleData.saturday.length}`);
    console.log(`  - Weekday entries: ${scheduleData.weekday.length}`);
    console.log(`  - Rotation cycle length: ${scheduleData.rotationCycleLength}`);
  } catch (err) {
    console.error(`Error writing ${outputFile}:`, err);
  }
}

// Process both directories
TARGET_DIRS.forEach(processDirectory);

console.log('\n✅ CSV to JSON conversion complete!');
