// scripts/createQr.js
/**
 * QR Code Generator Script
 * 
 * This script creates a QR code from the URL in config.json
 * and saves it as a PNG file in the data directory.
 */

// Import dependencies - works with both ES Modules and CommonJS
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const require = createRequire(import.meta.url);
const fs = require('fs');
const QRCode = require('qrcode');

// Get script directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config - configure paths relative to project root
const PROJECT_ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(PROJECT_ROOT, 'config/config.json');
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'data');
const OUTPUT_PATH = resolve(OUTPUT_DIR, 'qr.png');

console.log('QR Code Generator');
console.log('================');
console.log(`Config file: ${CONFIG_PATH}`);
console.log(`Output path: ${OUTPUT_PATH}`);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log(`Creating output directory: ${OUTPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate QR code from URL and save to file
 */
async function generateQrCode() {
  try {
    // Read config file
    if (!fs.existsSync(CONFIG_PATH)) {
      console.error(`Error: Config file not found: ${CONFIG_PATH}`);
      process.exit(1);
    }
    
    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);
    
    // Get URL from config
    const url = config.url || '';
    
    if (!url) {
      console.error('Error: URL not found. Make sure config.json contains a url key.');
      process.exit(1);
    }
    
    console.log(`Generating QR code for URL: ${url}`);
    
    // Generate QR code
    try {
      await QRCode.toFile(OUTPUT_PATH, url, {
        color: {
          dark: '#000',  // QR code color
          light: '#FFF'  // Background color
        },
        errorCorrectionLevel: 'H', // High error correction level
        width: 500, // Width in pixels
        margin: 4, // Margin
      });
      
      console.log(`✓ Successfully generated QR code: ${OUTPUT_PATH}`);
      process.exit(0);
    } catch (qrError) {
      console.error('Error generating QR code:', qrError);
      process.exit(1);
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: File not found: ${CONFIG_PATH}`);
    } else if (error instanceof SyntaxError) {
      console.error('Error parsing config.json. Invalid JSON format.');
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

// Execute the function
generateQrCode();
