// scripts/csv-to-json.js
/**
 * CSV to JSON conversion script
 * 
 * This script converts CSV files to JSON format before building the application,
 * which removes the need for runtime CSV parsing and reduces bundle size.
 */

// Import dependencies - works with both ES Modules and CommonJS
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const require = createRequire(import.meta.url);
const fs = require('fs');
const Papa = require('papaparse');

// Get script directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config - configure paths relative to project root
const PROJECT_ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(PROJECT_ROOT, 'data');
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'data/schedule');

console.log('CSV to JSON Conversion');
console.log('=====================');
console.log(`Data directory: ${DATA_DIR}`);
console.log(`Output directory: ${OUTPUT_DIR}`);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log(`Creating output directory: ${OUTPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Process CSV data into an array of formatted strings 
 * @param {string} csvData - CSV data as string
 * @returns {Array} Processed data
 */
function processCSVData(csvData) {
  try {
    // Parse CSV data
    const result = Papa.parse(csvData, {
      skipEmptyLines: true,
      dynamicTyping: false,
      header: false,
    });

    if (result.errors && result.errors.length > 0) {
      console.error("CSV Parse Error:", result.errors);
      return [];
    }

    // Convert parsed rows to comma-separated strings
    return result.data.map((row) => row.join(","));
  } catch (error) {
    console.error("Error processing CSV data:", error);
    return [];
  }
}

/**
 * Convert CSV file to JSON
 * @param {string} filename - CSV filename without extension
 */
function convertCsvToJson(filename) {
  const filePath = join(DATA_DIR, `${filename}.csv`);
  const outputPath = join(OUTPUT_DIR, `${filename}.json`);
  
  console.log(`Processing: ${filename}.csv`);
  
  try {
    // Check if CSV file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      return false;
    }
    
    // Read CSV file
    const csvData = fs.readFileSync(filePath, 'utf8');
    
    // Process the data
    const processedData = processCSVData(csvData);
    
    if (processedData.length === 0) {
      console.error(`Error: No data processed from ${filename}.csv`);
      return false;
    }
    
    // Write to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));
    
    console.log(`✓ Successfully converted ${filename}.csv to ${filename}.json (${processedData.length} entries)`);
    return true;
  } catch (error) {
    console.error(`Error converting ${filename}.csv:`, error);
    return false;
  }
}

// Convert all required CSV files
const filesToConvert = ['holiday', 'saturday', 'weekday'];
let successCount = 0;

filesToConvert.forEach(filename => {
  if (convertCsvToJson(filename)) {
    successCount++;
  }
});

console.log('\nConversion summary:');
console.log(`${successCount}/${filesToConvert.length} files successfully converted`);

if (successCount === filesToConvert.length) {
  console.log('\n✅ CSV to JSON conversion complete!');
  process.exit(0);
} else {
  console.error('\n❌ Some conversions failed!');
  process.exit(1);
}
