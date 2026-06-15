// src/__tests__/composables/useScheduleImport.test.js
// Tests for the schedule-import parser/validator (admin Phase 2).
import { describe, it, expect } from "vitest";
import {
  parseCsvRows,
  validateTrio,
  buildPreviewData,
  serializeCsv,
  suggestFolderName,
  validateEpochMeta,
} from "@/composables/useScheduleImport";

// ---------- parseCsvRows ----------

describe("parseCsvRows()", () => {
  it("正常な3列CSVを行に変換する", () => {
    const { rows, errors } = parseCsvRows("公休,,\n早番,08:00,16:00\n");
    expect(errors).toEqual([]);
    expect(rows).toEqual([
      { subject: "公休", startTime: "", endTime: "" },
      { subject: "早番", startTime: "08:00", endTime: "16:00" },
    ]);
  });

  it("空行はスキップする（末尾・中間とも）", () => {
    const { rows } = parseCsvRows("\n公休,,\n\n早番,08:00,16:00\n\n");
    expect(rows).toHaveLength(2);
  });

  it("夜勤・遅番など日跨ぎ時刻を許可する", () => {
    const { errors } = parseCsvRows("遅番,16:00,00:00\n夜勤,00:00,08:00");
    expect(errors).toEqual([]);
  });

  it("項目が3つでない行をエラーにする", () => {
    const { errors } = parseCsvRows("早番(A,B),08:00,16:00");
    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(1);
  });

  it("subject が空の行をエラーにする", () => {
    const { errors } = parseCsvRows(",08:00,16:00");
    expect(errors[0].message).toMatch(/subject/);
  });

  it("開始だけ/終了だけはエラー", () => {
    expect(parseCsvRows("早番,08:00,").errors).toHaveLength(1);
    expect(parseCsvRows("早番,,16:00").errors).toHaveLength(1);
  });

  it("24h超え表記（25:00 など日跨ぎ）を許可する", () => {
    expect(parseCsvRows("夜勤,16:00,25:00").errors).toEqual([]);
    expect(parseCsvRows("深夜,22:00,47:59").errors).toEqual([]);
  });

  it("不正な時刻フォーマットをエラーにする", () => {
    expect(parseCsvRows("早番,8:00,16:00").errors).toHaveLength(1);
    expect(parseCsvRows("早番,48:00,49:00").errors).toHaveLength(1);
    expect(parseCsvRows("早番,99:00,16:00").errors).toHaveLength(1);
  });
});

// ---------- validateTrio ----------

const goodTrio = {
  weekday: "公休,,\n早番,08:00,16:00",
  saturday: "公休,,\n遅番,16:00,00:00",
  holiday: "法休,,\n夜勤,00:00,08:00",
};

describe("validateTrio()", () => {
  it("3ファイル整合で ok、cycleLength を返す", () => {
    const r = validateTrio(goodTrio);
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
    expect(r.cycleLength).toBe(2);
  });

  it("行数不一致を検出する", () => {
    const r = validateTrio({
      ...goodTrio,
      holiday: "法休,,",
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /コマ数/.test(e))).toBe(true);
  });

  it("空ファイルを検出する", () => {
    const r = validateTrio({ ...goodTrio, weekday: "" });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /平日.*空/.test(e))).toBe(true);
  });

  it("ラベル付きで行エラーを伝える", () => {
    const r = validateTrio({
      ...goodTrio,
      saturday: "公休,,\n早番,99:00,16:00",
    });
    expect(r.errors.some((e) => /土曜\.csv 2行目/.test(e))).toBe(true);
  });
});

// ---------- buildPreviewData ----------

describe("buildPreviewData()", () => {
  it("圧縮キー {s,sT,eT} に変換し、空時刻はキーごと省く", () => {
    const { trio } = validateTrio(goodTrio);
    const data = buildPreviewData(trio);
    expect(data.rotationCycleLength).toBe(2);
    expect(data.weekday[0]).toEqual({ s: "公休" });
    expect(data.weekday[1]).toEqual({ s: "早番", sT: "08:00", eT: "16:00" });
  });
});

// ---------- serializeCsv ----------

describe("serializeCsv()", () => {
  it("正規化したCSVテキストを末尾改行付きで返す", () => {
    const rows = [
      { subject: "公休", startTime: "", endTime: "" },
      { subject: "早番", startTime: "08:00", endTime: "16:00" },
    ];
    expect(serializeCsv(rows)).toBe("公休,,\n早番,08:00,16:00\n");
  });
});

// ---------- suggestFolderName ----------

describe("suggestFolderName()", () => {
  it("有効日から rev<YYYYMMDD> を作る", () => {
    expect(suggestFolderName("2026-08-01")).toBe("rev20260801");
  });
});

// ---------- validateEpochMeta ----------

describe("validateEpochMeta()", () => {
  const existingFroms = ["2026-05-16"];

  it("最後の世代より後・重複なしなら ok", () => {
    const r = validateEpochMeta({
      fromStr: "2026-08-01",
      folder: "rev20260801",
      existingFroms,
      existingFolders: ["default"],
    });
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it("重複する有効日をエラーにする", () => {
    const r = validateEpochMeta({
      fromStr: "2026-05-16",
      folder: "x",
      existingFroms,
    });
    expect(r.errors.some((e) => /重複/.test(e))).toBe(true);
  });

  it("最後の世代より前の有効日をエラーにする", () => {
    const r = validateEpochMeta({
      fromStr: "2026-01-01",
      folder: "x",
      existingFroms,
    });
    expect(r.errors.some((e) => /後にして/.test(e))).toBe(true);
  });

  it("不正なフォルダ名をエラーにする", () => {
    const r = validateEpochMeta({
      fromStr: "2026-08-01",
      folder: "rev 2026/01",
      existingFroms,
    });
    expect(r.errors.some((e) => /フォルダ名/.test(e))).toBe(true);
  });

  it("既存フォルダ名は警告（上書き）", () => {
    const r = validateEpochMeta({
      fromStr: "2026-08-01",
      folder: "default",
      existingFroms,
      existingFolders: ["default"],
    });
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => /上書き/.test(w))).toBe(true);
  });

  it("過去の有効日は警告", () => {
    const r = validateEpochMeta({
      fromStr: "2000-01-01",
      folder: "x",
      existingFroms: [],
    });
    expect(r.warnings.some((w) => /過去/.test(w))).toBe(true);
  });
});
