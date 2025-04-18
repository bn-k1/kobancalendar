// replace.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { glob } from 'glob';

// ES Module環境では __dirname が使えないので代替を作成
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 置換パターンの定義
const replacements = [
  // ISO_DATE フォーマット（YYYY-MM-DD）の置換
  {
    pattern: /"(\d{4})-(\d{2})-(\d{2})"/g,
    test: (match) => {
      // 日付として有効かチェック
      const date = new Date(match.replace(/"/g, ''));
      return !isNaN(date) && date.getFullYear() >= 2000 && date.getFullYear() <= 2100;
    },
    replacement: 'dayjs().format(DATE_FORMATS.ISO_DATE)'
  },
  {
    pattern: /format\("YYYY-MM-DD"\)/g,
    replacement: 'format(DATE_FORMATS.ISO_DATE)'
  },
  {
    pattern: /format\('YYYY-MM-DD'\)/g,
    replacement: "format(DATE_FORMATS.ISO_DATE)"
  },
  
  // DISPLAY_DATE フォーマット（YYYY/MM/DD）の置換
  {
    pattern: /format\("YYYY\/MM\/DD"\)/g,
    replacement: 'format(DATE_FORMATS.DISPLAY_DATE)'
  },
  {
    pattern: /format\('YYYY\/MM\/DD'\)/g,
    replacement: "format(DATE_FORMATS.DISPLAY_DATE)"
  },
  
  // FILE_NAME_DATE フォーマット（YYYYMMDD）の置換
  {
    pattern: /format\("YYYYMMDD"\)/g,
    replacement: 'format(DATE_FORMATS.FILE_NAME_DATE)'
  },
  {
    pattern: /format\('YYYYMMDD'\)/g,
    replacement: "format(DATE_FORMATS.FILE_NAME_DATE)"
  }
];

// インポート文を追加する関数
function addImportIfNeeded(content, importToAdd) {
  if (!content.includes(importToAdd) && 
      content.includes('DATE_FORMATS') && 
      !content.includes('import { DATE_FORMATS }')) {
    
    // すでにconstantsからインポートがある場合は修正
    if (content.includes('import { ') && content.includes(' } from "@/config/constants";')) {
      return content.replace(/import \{([^}]+)\} from "@\/config\/constants";/, 
                             (match, imports) => {
                               if (!imports.includes('DATE_FORMATS')) {
                                 return `import {${imports}, DATE_FORMATS } from "@/config/constants";`;
                               }
                               return match;
                             });
    } 
    // 新しいインポート文を追加
    else {
      return importToAdd + '\n' + content;
    }
  }
  return content;
}

// ファイルを処理する関数
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // 各置換パターンを適用
  for (const { pattern, replacement, test } of replacements) {
    const matches = [...content.matchAll(pattern)];
    
    if (matches.length > 0) {
      for (const match of matches) {
        // テスト関数がある場合は実行
        if (!test || test(match[0])) {
          content = content.replace(match[0], replacement);
          changed = true;
        }
      }
    }
  }
  
  // DATE_FORMATSを使用している場合、インポート文を追加
  if (changed || content.includes('DATE_FORMATS')) {
    const importStatement = 'import { DATE_FORMATS } from "@/config/constants";';
    content = addImportIfNeeded(content, importStatement);
  }
  
  // 変更があれば保存
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    return 1;
  }
  
  return 0;
}

// src ディレクトリ内のすべての JS と Vue ファイルを処理
async function processAllFiles(rootDir) {
  // ES Module環境ではglobはPromiseを返すのでawaitを使用
  const files = await glob(`${rootDir}/**/*.{js,vue}`, { ignore: '**/node_modules/**' });
  let updatedCount = 0;
  
  for (const file of files) {
    updatedCount += processFile(file);
  }
  
  console.log(`\nTotal files updated: ${updatedCount} out of ${files.length}`);
}

// スクリプト実行
const srcDir = path.resolve(dirname(__dirname), 'src');
processAllFiles(srcDir).catch(err => console.error(err));