// scripts/applyUpdate.js
/**
 * Apply schedule or base date updates based on config.json.
 *
 * - If both schedule_update and next_base_date exist, remove schedule_update.
 * - If only schedule_update exists and the date is today or earlier, set
 *   default_base_date to schedule_update and overwrite CSV files from
 *   data/next to data/default.
 * - If only next_base_date exists and the date is today or earlier, set
 *   default_base_date to next_base_date and overwrite CSV files from
 *   data/next to data/default.
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import readline from 'readline';

const require = createRequire(import.meta.url);
const fs = require('fs');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(PROJECT_ROOT, 'config', 'config.json');
const NEXT_DIR = resolve(PROJECT_ROOT, 'data', 'next');
const DEFAULT_DIR = resolve(PROJECT_ROOT, 'data', 'default');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(`${question} [y/N]: `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

console.log('Apply Update Script');
console.log('===================');
console.log(`Config path: ${CONFIG_PATH}`);
console.log(`Next data dir: ${NEXT_DIR}`);
console.log(`Default data dir: ${DEFAULT_DIR}`);

// Load config.json
if (!fs.existsSync(CONFIG_PATH)) {
  console.error(`Config file not found: ${CONFIG_PATH}`);
  process.exit(1);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (err) {
  console.error('Failed to read config.json:', err);
  process.exit(1);
}

const todayStr = new Date().toISOString().slice(0, 10);
const hasScheduleUpdate = Object.prototype.hasOwnProperty.call(config, 'schedule_update');
const hasNextBaseDate = Object.prototype.hasOwnProperty.call(config, 'next_base_date');

let updated = false;

function moveCsvFiles() {
  if (!fs.existsSync(NEXT_DIR)) {
    console.warn(`Next directory does not exist: ${NEXT_DIR}`);
    return;
  }

  const files = fs.readdirSync(NEXT_DIR).filter(f => f.endsWith('.csv'));
  if (files.length === 0) {
    console.warn('No CSV files found in next directory.');
  }

  for (const file of files) {
    const src = join(NEXT_DIR, file);
    const dest = join(DEFAULT_DIR, file);
    try {
      fs.renameSync(src, dest);
      console.log(`Moved ${file} to default directory.`);
    } catch (err) {
      console.error(`Failed to move ${file}:`, err);
    }
  }
}

async function main() {
  if (hasScheduleUpdate && hasNextBaseDate) {
    console.log('Both schedule_update and next_base_date found.');
    const confirm = await askConfirmation('Remove schedule_update?');
    if (confirm) {
      delete config.schedule_update;
      updated = true;
      console.log('schedule_update removed.');
    }
  } else if (hasScheduleUpdate && !hasNextBaseDate) {
    if (config.schedule_update <= todayStr) {
      console.log(`schedule_update (${config.schedule_update}) is today or earlier.`);
      const confirmUpdate = await askConfirmation('Apply schedule_update as new default_base_date?');
      if (confirmUpdate) {
        config.default_base_date = config.schedule_update;
        delete config.schedule_update;
        updated = true;
        console.log('schedule_update applied as default_base_date.');
        
        const confirmMove = await askConfirmation('Move CSV files?');
        if (confirmMove) {
          moveCsvFiles();
        }
      }
    } else {
      console.log('schedule_update date is in the future. No changes applied.');
    }
  } else if (hasNextBaseDate && !hasScheduleUpdate) {
    if (config.next_base_date <= todayStr) {
      console.log(`next_base_date (${config.next_base_date}) is today or earlier.`);
      const confirmUpdate = await askConfirmation('Apply next_base_date as new default_base_date?');
      if (confirmUpdate) {
        config.default_base_date = config.next_base_date;
        delete config.next_base_date;
        updated = true;
        console.log('next_base_date applied as default_base_date.');
        
        const confirmMove = await askConfirmation('Move CSV files?');
        if (confirmMove) {
          moveCsvFiles();
        }
      }
    } else {
      console.log('next_base_date date is in the future. No changes applied.');
    }
  }

  if (updated) {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
      console.log('Config updated successfully.');
    } catch (err) {
      console.error('Failed to write config.json:', err);
      process.exit(1);
    }
  } else {
    console.log('No updates performed.');
  }

  rl.close();
  console.log('Done.');
}

main().catch(err => {
  console.error('Script failed:', err);
  rl.close();
  process.exit(1);
});
