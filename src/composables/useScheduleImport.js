// Schedule import — parse and hard-validate the three shift-table CSVs
// (weekday / saturday / holiday) before they are committed via the admin page.
//
// The canonical input is exactly the existing on-disk format: rows of
// `subject,startTime,endTime` with no header, one row per rotation slot (コマ),
// row 1 = コマ1. How the admin produces those CSVs (by hand, spreadsheet, or a
// chat AI) is out of scope — this module only accepts the format and refuses
// anything that would build a broken schedule.
//
// Validation here mirrors the build-time checks in scripts/convertCsv.js and
// buildEpochs() (src/composables/useAppInitializer.js) so the admin sees the
// same failures in the browser that CI would later enforce.

import { createDate, today } from "@/utils/date";

// 24h HH:MM, 00:00–23:59. Overnight shifts (e.g. 16:00→00:00) are allowed:
// we validate format only, never that end > start.
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const FOLDER_RE = /^[A-Za-z0-9_-]+$/;

// Parse one CSV file's text into rows. Blank lines (anywhere) are skipped.
// Returns { rows: [{subject,startTime,endTime}], errors: [{line, message}] }.
export function parseCsvRows(text) {
  const lines = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const rows = [];
  const errors = [];

  lines.forEach((raw, i) => {
    if (raw.trim() === "") return; // skip blank lines incl. trailing newline
    const lineNo = i + 1;
    const parts = raw.split(",");
    if (parts.length !== 3) {
      errors.push({
        line: lineNo,
        message: `項目が3つではありません（${parts.length}個）。subject にカンマが入っていませんか？`,
      });
      return;
    }
    const subject = parts[0].trim();
    const startTime = parts[1].trim();
    const endTime = parts[2].trim();

    if (subject === "") {
      errors.push({ line: lineNo, message: "subject（勤務名）が空です" });
      return;
    }
    const hasStart = startTime !== "";
    const hasEnd = endTime !== "";
    if (hasStart !== hasEnd) {
      errors.push({
        line: lineNo,
        message: "開始時刻と終了時刻は両方空にするか両方入れてください",
      });
      return;
    }
    if (hasStart && !TIME_RE.test(startTime)) {
      errors.push({
        line: lineNo,
        message: `開始時刻が不正です: ${startTime}`,
      });
      return;
    }
    if (hasEnd && !TIME_RE.test(endTime)) {
      errors.push({ line: lineNo, message: `終了時刻が不正です: ${endTime}` });
      return;
    }
    rows.push({ subject, startTime, endTime });
  });

  return { rows, errors };
}

// Validate the three files together. `texts` = { weekday, saturday, holiday }.
// Returns { ok, errors: string[], cycleLength, trio: { weekday, saturday, holiday } }.
export function validateTrio(texts = {}) {
  const errors = [];
  const parsed = {};
  const KINDS = [
    ["weekday", "平日"],
    ["saturday", "土曜"],
    ["holiday", "日祝"],
  ];

  for (const [key, label] of KINDS) {
    const result = parseCsvRows(texts[key]);
    parsed[key] = result.rows;
    for (const e of result.errors) {
      errors.push(`${label}.csv ${e.line}行目: ${e.message}`);
    }
    if (result.rows.length === 0 && result.errors.length === 0) {
      errors.push(`${label}.csv が空です`);
    }
  }

  const lengths = {
    weekday: parsed.weekday.length,
    saturday: parsed.saturday.length,
    holiday: parsed.holiday.length,
  };
  const allHaveRows =
    lengths.weekday > 0 && lengths.saturday > 0 && lengths.holiday > 0;
  if (
    allHaveRows &&
    (lengths.weekday !== lengths.holiday ||
      lengths.saturday !== lengths.holiday)
  ) {
    errors.push(
      `コマ数（行数）が一致しません: 平日=${lengths.weekday}, 土曜=${lengths.saturday}, 日祝=${lengths.holiday}。3つとも同じ行数にしてください`,
    );
  }

  const cycleLength = allHaveRows ? lengths.holiday : 0;
  return {
    ok: errors.length === 0,
    errors,
    cycleLength,
    trio: parsed,
  };
}

// Build the in-memory store shape ({ s, sT?, eT?, rotationCycleLength }) for a
// live preview, matching what scripts/convertCsv.js emits at build time.
export function buildPreviewData(trio) {
  const toRows = (rows) =>
    rows.map((r) => {
      const out = { s: r.subject };
      if (r.startTime) out.sT = r.startTime;
      if (r.endTime) out.eT = r.endTime;
      return out;
    });
  return {
    weekday: toRows(trio.weekday),
    saturday: toRows(trio.saturday),
    holiday: toRows(trio.holiday),
    rotationCycleLength: trio.holiday.length,
  };
}

// Re-emit canonical CSV text (so committed files are normalized, trailing NL).
export function serializeCsv(rows) {
  return (
    rows.map((r) => `${r.subject},${r.startTime},${r.endTime}`).join("\n") +
    "\n"
  );
}

// Suggest a unique-ish folder name from the effective date, e.g. rev20260801.
export function suggestFolderName(fromStr) {
  const d = createDate(fromStr);
  if (!d || !d.isValid()) return "";
  return `rev${d.format("YYYYMMDD")}`;
}

// Validate the new generation's metadata against the existing epochs.
//   fromStr        — "YYYY-MM-DD" the new generation takes effect
//   folder         — target data folder name
//   existingFroms  — array of existing epoch `from` strings (any order)
//   existingFolders— array of existing data folder names
// Returns { ok, errors: string[], warnings: string[] }.
export function validateEpochMeta({
  fromStr,
  folder,
  existingFroms = [],
  existingFolders = [],
} = {}) {
  const errors = [];
  const warnings = [];

  const from = createDate(fromStr);
  if (!fromStr || !from || !from.isValid()) {
    errors.push("有効日（from）が不正です。YYYY-MM-DD で入力してください");
  } else {
    const fromKey = from.format("YYYY-MM-DD");
    const existing = existingFroms
      .map((f) => createDate(f))
      .filter((d) => d && d.isValid());
    if (existing.some((d) => d.format("YYYY-MM-DD") === fromKey)) {
      errors.push(`有効日が既存の世代と重複しています: ${fromKey}`);
    } else {
      const last = existing.reduce(
        (max, d) => (max && max.isAfter(d) ? max : d),
        null,
      );
      if (last && !from.isAfter(last)) {
        errors.push(
          `有効日は最後の世代（${last.format("YYYY-MM-DD")}）より後にしてください`,
        );
      }
    }
    if (from.isBefore(today(), "day")) {
      warnings.push(
        "有効日が過去の日付です。すぐに現行世代として表示されます。typo を確認してください",
      );
    }
    if (from.isAfter(today().add(2, "year"), "day")) {
      warnings.push("有効日が2年以上先です。typo を確認してください");
    }
  }

  if (!folder || !FOLDER_RE.test(folder)) {
    errors.push(
      "フォルダ名は半角英数・ハイフン・アンダースコアのみで入力してください",
    );
  } else if (folder === "menu") {
    errors.push("フォルダ名 'menu' は使えません");
  } else if (existingFolders.includes(folder)) {
    warnings.push(`フォルダ '${folder}' は既に存在します。CSVが上書きされます`);
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function useScheduleImport() {
  return {
    parseCsvRows,
    validateTrio,
    buildPreviewData,
    serializeCsv,
    suggestFolderName,
    validateEpochMeta,
  };
}
