// scripts/convertCsv.js
// Build step: config.json + data/<folder>/*.csv -> data/scheduleData.json
//
//   { epochs: [{ from, segments: [{ from, data }] }], data: { <folder>: { holiday, saturday, weekday, rotationCycleLength } } }
//
// All config validation lives here, so a broken config fails the build (and
// therefore CI) instead of the user's first page load. The browser trusts
// the resolved `epochs` as-is.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import Papa from "papaparse";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = join(ROOT, "config", "config.json");
const OUTPUT_FILE = join(ROOT, "data", "scheduleData.json");
const FILES = ["holiday", "saturday", "weekday"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Papa's skipEmptyLines would silently drop a blank line, which can hide a
// row-count mismatch if it sits at the same position in all three files.
export function findBlankLines(csv) {
  const lines = csv.replace(/\r\n?/g, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  return lines.flatMap((line, i) => (line === "" ? [i + 1] : []));
}

export function parseCsv(csv) {
  const { data, errors } = Papa.parse(csv, { skipEmptyLines: true });
  if (errors.length)
    throw new Error(`CSV parse error: ${JSON.stringify(errors)}`);
  return data.map(([s = "", sT = "", eT = ""]) => {
    const row = { s: s.trim() };
    if (sT.trim()) row.sT = sT.trim();
    if (eT.trim()) row.eT = eT.trim();
    return row;
  });
}

/**
 * Normalize config.schedules into `[{ from, segments: [{ from, data }] }]`.
 * `data` omitted = inherit the previous epoch's last folder (position-shift
 * migration); `data` as an array = in-epoch table swap (same anchor, same
 * rotation phase). Throws on any structural error.
 */
export function resolveEpochs(schedules) {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    throw new Error("config.schedules は非空配列である必要があります");
  }
  const epochs = schedules.map((entry, i) => {
    const { from, data } = entry ?? {};
    if (!ISO_DATE.test(from))
      throw new Error(`schedules[${i}].from が不正です: ${from}`);
    if (Array.isArray(data)) {
      if (!data.length) throw new Error(`schedules[${i}].data 配列が空です`);
      return {
        from,
        segments: data.map((seg, si) => ({
          from: si === 0 ? from : seg.from,
          data: seg.data,
        })),
      };
    }
    return { from, segments: [{ from, data }] };
  });

  epochs.forEach((epoch, i) => {
    const prev = epochs[i - 1];
    if (prev && epoch.from <= prev.from) {
      throw new Error(
        `schedules の from は昇順・重複なし: ${prev.from} → ${epoch.from}`,
      );
    }
    epoch.segments.forEach((seg, si) => {
      if (!seg.data) {
        if (!prev || si > 0)
          throw new Error(`schedules[${i}] に data がありません`);
        seg.data = prev.segments.at(-1).data;
      }
      if (
        si > 0 &&
        !(ISO_DATE.test(seg.from) && seg.from > epoch.segments[si - 1].from)
      ) {
        throw new Error(
          `schedules[${i}].data[${si}].from は昇順の日付である必要があります`,
        );
      }
      const next = epochs[i + 1];
      if (next && seg.from >= next.from) {
        throw new Error(
          `schedules[${i}] のセグメント ${seg.from} が次世代 ${next.from} 以降です`,
        );
      }
    });
  });
  return epochs;
}

/** In-epoch table swaps keep the rotation phase, so cycle lengths must match. */
export function checkSegmentCycles(epochs, data) {
  epochs.forEach(({ segments }, i) => {
    const cycles = new Set(
      segments.map((seg) => data[seg.data].rotationCycleLength),
    );
    if (cycles.size > 1)
      throw new Error(
        `schedules[${i}] のセグメントはサイクル長が一致する必要があります`,
      );
  });
}

function convertFolder(folder) {
  const tables = {};
  for (const name of FILES) {
    const path = join(ROOT, "data", folder, `${name}.csv`);
    const csv = readFileSync(path, "utf8");
    const blanks = findBlankLines(csv);
    if (blanks.length)
      throw new Error(`${path}: 空行があります（${blanks.join(", ")} 行目）`);
    tables[name] = parseCsv(csv);
  }
  const counts = FILES.map((name) => tables[name].length);
  if (!counts[0] || new Set(counts).size > 1) {
    throw new Error(
      `data/${folder}: 行数が不一致または空です（${FILES.map((n, i) => `${n}=${counts[i]}`).join(", ")}）`,
    );
  }
  return { ...tables, rotationCycleLength: counts[0] };
}

function main() {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  const epochs = resolveEpochs(config.schedules);
  const folders = [
    ...new Set(epochs.flatMap((e) => e.segments.map((s) => s.data))),
  ];
  const data = Object.fromEntries(folders.map((f) => [f, convertFolder(f)]));
  checkSegmentCycles(epochs, data);

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify({ epochs, data }));
  console.log(
    `✓ scheduleData.json: ${folders.map((f) => `${f}(${data[f].rotationCycleLength})`).join(", ")}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}
