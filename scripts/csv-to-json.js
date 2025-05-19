// scripts/csv-to-json.js
/**
 * CSV to JSON conversion script
 *
 * This script converts CSV files to JSON format for two data sets (default and next),
 * which removes the need for runtime CSV parsing and reduces bundle size.
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
console.log('=====================');

// Project root directory (one level up from this script)
const PROJECT_ROOT = resolve(__dirname, '..');

// Data sets and files to convert
const TARGET_DIRS = ['default', 'next'];
const FILES_TO_CONVERT = ['holiday', 'saturday', 'weekday'];

/**
 * Process raw CSV data into an array of comma-separated strings
 * @param {string} csvData - CSV content as a string
 * @returns {string[]} Array of processed row strings
 */
function processCSVData(csvData) {
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

    return result.data.map(row => row.join(','));
  } catch (error) {
    console.error('Error processing CSV data:', error);
    return [];
  }
}

// Iterate over each target directory
TARGET_DIRS.forEach(dirName => {
  const inputDir = resolve(PROJECT_ROOT, 'data', dirName);
  const outputDir = resolve(inputDir, 'json');

  console.log(`\nProcessing directory: ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Convert each specified file
  FILES_TO_CONVERT.forEach(filename => {
    const csvPath = join(inputDir, `${filename}.csv`);
    const jsonPath = join(outputDir, `${filename}.json`);

    console.log(`Converting ${csvPath} -> ${jsonPath}`);
    let processedData = [];

    if (fs.existsSync(csvPath)) {
      try {
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        processedData = processCSVData(csvContent);
      } catch (err) {
        console.error(`Error reading or parsing ${csvPath}:`, err);
        processedData = [];
      }
    } else {
      console.warn(`File not found: ${csvPath}. Generating empty JSON array.`);
      processedData = [];
    }

    try {
      fs.writeFileSync(jsonPath, JSON.stringify(processedData, null, 2));
      console.log(`✓ ${filename}.json created (${processedData.length} entries)`);
    } catch (err) {
      console.error(`Error writing ${jsonPath}:`, err);
    }
  });
});

console.log('\n✅ CSV to JSON conversion complete!');
