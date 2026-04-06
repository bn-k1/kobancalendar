// src/__tests__/utils/date.test.js
// Characterization tests for date utilities - documents existing behavior
import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import {
  createDate,
  formatDate,
  formatAsISODate,
  formatAsDisplayDate,
  formatAsFileName,
  getWeekdayName,
  isSameDay,
  isBefore,
  isAfter,
  isSameOrBefore,
  isSameOrAfter,
  isSame,
  addDays,
  addMonths,
  startOfDay,
  getDayOfWeek,
  isWeekend,
  isSaturday,
  isSunday,
  toDate,
  toUnix,
  parseTime,
} from "@/utils/date";

describe("createDate", () => {
  it("文字列からdayjsオブジェクトを生成する", () => {
    const d = createDate("2025-11-16");
    expect(dayjs.isDayjs(d)).toBe(true);
    expect(d.format("YYYY-MM-DD")).toBe("2025-11-16");
  });

  it("dayjsオブジェクトはそのまま返す", () => {
    const orig = dayjs("2025-11-16");
    const d = createDate(orig);
    expect(d).toBe(orig);
  });

  it("Dateオブジェクトをdayjsに変換する", () => {
    const native = new Date("2025-11-16");
    const d = createDate(native);
    expect(dayjs.isDayjs(d)).toBe(true);
    expect(d.format("YYYY-MM-DD")).toBe("2025-11-16");
  });
});

describe("formatDate", () => {
  it("指定フォーマットで日付を文字列化する", () => {
    expect(formatDate("2025-11-16", "YYYY/MM/DD")).toBe("2025/11/16");
    expect(formatDate("2025-01-05", "YYYYMMDD")).toBe("20250105");
  });
});

describe("formatAsISODate", () => {
  it("YYYY-MM-DD 形式で返す", () => {
    expect(formatAsISODate("2025-11-16")).toBe("2025-11-16");
    expect(formatAsISODate("2026-01-01")).toBe("2026-01-01");
  });
});

describe("formatAsDisplayDate", () => {
  it("YYYY/MM/DD 形式で返す", () => {
    expect(formatAsDisplayDate("2025-11-16")).toBe("2025/11/16");
    expect(formatAsDisplayDate("2026-01-01")).toBe("2026/01/01");
  });
});

describe("formatAsFileName", () => {
  it("YYYYMMDD 形式で返す", () => {
    expect(formatAsFileName("2025-11-16")).toBe("20251116");
    expect(formatAsFileName("2026-01-05")).toBe("20260105");
  });
});

describe("getWeekdayName", () => {
  it("各曜日の日本語名を返す", () => {
    // 2025-11-16 は日曜
    expect(getWeekdayName("2025-11-16")).toBe("日");
    // 2025-11-17 は月曜
    expect(getWeekdayName("2025-11-17")).toBe("月");
    // 2025-11-18 は火曜
    expect(getWeekdayName("2025-11-18")).toBe("火");
    // 2025-11-19 は水曜
    expect(getWeekdayName("2025-11-19")).toBe("水");
    // 2025-11-20 は木曜
    expect(getWeekdayName("2025-11-20")).toBe("木");
    // 2025-11-21 は金曜
    expect(getWeekdayName("2025-11-21")).toBe("金");
    // 2025-11-22 は土曜
    expect(getWeekdayName("2025-11-22")).toBe("土");
  });
});

describe("isSameDay", () => {
  it("同じ日付は true を返す", () => {
    expect(isSameDay("2025-11-16", "2025-11-16")).toBe(true);
  });

  it("異なる日付は false を返す", () => {
    expect(isSameDay("2025-11-16", "2025-11-17")).toBe(false);
  });

  it("時刻が異なっても同じ日なら true を返す", () => {
    const d1 = dayjs("2025-11-16T08:00:00");
    const d2 = dayjs("2025-11-16T23:59:59");
    expect(isSameDay(d1, d2)).toBe(true);
  });
});

describe("isBefore", () => {
  it("前の日付は true を返す", () => {
    expect(isBefore("2025-11-15", "2025-11-16")).toBe(true);
  });

  it("後の日付は false を返す", () => {
    expect(isBefore("2025-11-17", "2025-11-16")).toBe(false);
  });

  it("同じ日付は false を返す", () => {
    expect(isBefore("2025-11-16", "2025-11-16")).toBe(false);
  });
});

describe("isAfter", () => {
  it("後の日付は true を返す", () => {
    expect(isAfter("2025-11-17", "2025-11-16")).toBe(true);
  });

  it("前の日付は false を返す", () => {
    expect(isAfter("2025-11-15", "2025-11-16")).toBe(false);
  });

  it("同じ日付は false を返す", () => {
    expect(isAfter("2025-11-16", "2025-11-16")).toBe(false);
  });
});

describe("isSameOrBefore", () => {
  it("前の日付は true を返す", () => {
    expect(isSameOrBefore("2025-11-15", "2025-11-16")).toBe(true);
  });

  it("同じ日付は true を返す（境界値）", () => {
    expect(isSameOrBefore("2025-11-16", "2025-11-16")).toBe(true);
  });

  it("後の日付は false を返す", () => {
    expect(isSameOrBefore("2025-11-17", "2025-11-16")).toBe(false);
  });
});

describe("isSameOrAfter", () => {
  it("後の日付は true を返す", () => {
    expect(isSameOrAfter("2025-11-17", "2025-11-16")).toBe(true);
  });

  it("同じ日付は true を返す（境界値）", () => {
    expect(isSameOrAfter("2025-11-16", "2025-11-16")).toBe(true);
  });

  it("前の日付は false を返す", () => {
    expect(isSameOrAfter("2025-11-15", "2025-11-16")).toBe(false);
  });
});

describe("isSame", () => {
  it("デフォルトは day 単位で比較する", () => {
    expect(isSame("2025-11-16", "2025-11-16")).toBe(true);
    expect(isSame("2025-11-15", "2025-11-16")).toBe(false);
  });

  it("month 単位で比較できる", () => {
    expect(isSame("2025-11-01", "2025-11-30", "month")).toBe(true);
    expect(isSame("2025-10-31", "2025-11-01", "month")).toBe(false);
  });
});

describe("addDays", () => {
  it("正の日数を加算する", () => {
    expect(formatAsISODate(addDays("2025-11-16", 5))).toBe("2025-11-21");
  });

  it("負の日数を減算する", () => {
    expect(formatAsISODate(addDays("2025-11-16", -1))).toBe("2025-11-15");
  });

  it("月をまたいで加算する", () => {
    expect(formatAsISODate(addDays("2025-11-30", 1))).toBe("2025-12-01");
  });
});

describe("addMonths", () => {
  it("正の月数を加算する", () => {
    expect(formatAsISODate(addMonths("2025-11-16", 1))).toBe("2025-12-16");
  });

  it("負の月数を減算する", () => {
    expect(formatAsISODate(addMonths("2025-11-16", -1))).toBe("2025-10-16");
  });

  it("年をまたいで加算する", () => {
    expect(formatAsISODate(addMonths("2025-11-16", 2))).toBe("2026-01-16");
  });
});

describe("startOfDay", () => {
  it("時刻を00:00:00にリセットする", () => {
    const d = startOfDay("2025-11-16");
    expect(d.hour()).toBe(0);
    expect(d.minute()).toBe(0);
    expect(d.second()).toBe(0);
    expect(d.millisecond()).toBe(0);
  });
});

describe("getDayOfWeek", () => {
  it("日曜は 0 を返す", () => {
    expect(getDayOfWeek("2025-11-16")).toBe(0);
  });

  it("土曜は 6 を返す", () => {
    expect(getDayOfWeek("2025-11-22")).toBe(6);
  });

  it("月曜は 1 を返す", () => {
    expect(getDayOfWeek("2025-11-17")).toBe(1);
  });
});

describe("isWeekend", () => {
  it("日曜は true を返す", () => {
    expect(isWeekend("2025-11-16")).toBe(true);
  });

  it("土曜は true を返す", () => {
    expect(isWeekend("2025-11-22")).toBe(true);
  });

  it("平日は false を返す", () => {
    expect(isWeekend("2025-11-17")).toBe(false);
    expect(isWeekend("2025-11-21")).toBe(false);
  });
});

describe("isSaturday", () => {
  it("土曜は true を返す", () => {
    expect(isSaturday("2025-11-22")).toBe(true);
  });

  it("日曜は false を返す", () => {
    expect(isSaturday("2025-11-16")).toBe(false);
  });

  it("平日は false を返す", () => {
    expect(isSaturday("2025-11-17")).toBe(false);
  });
});

describe("isSunday", () => {
  it("日曜は true を返す", () => {
    expect(isSunday("2025-11-16")).toBe(true);
  });

  it("土曜は false を返す", () => {
    expect(isSunday("2025-11-22")).toBe(false);
  });

  it("平日は false を返す", () => {
    expect(isSunday("2025-11-17")).toBe(false);
  });
});

describe("toDate", () => {
  it("native Date オブジェクトを返す", () => {
    const d = toDate("2025-11-16");
    expect(d instanceof Date).toBe(true);
  });
});

describe("toUnix", () => {
  it("Unix タイムスタンプ（秒）を返す", () => {
    const unix = toUnix("2025-11-16");
    expect(typeof unix).toBe("number");
    // 2025-11-16 の unix は正の整数
    expect(unix).toBeGreaterThan(0);
  });

  it("同じ日付なら同じ値を返す", () => {
    expect(toUnix("2025-11-16")).toBe(toUnix("2025-11-16"));
  });

  it("日付が1日違えば 86400 秒差になる", () => {
    const diff = toUnix("2025-11-17") - toUnix("2025-11-16");
    expect(diff).toBe(86400);
  });
});

describe("parseTime", () => {
  it("HH:MM 形式をパースする", () => {
    const t = parseTime("17:00");
    expect(t.hour()).toBe(17);
    expect(t.minute()).toBe(0);
  });

  it("分も正しくパースする", () => {
    const t = parseTime("08:30");
    expect(t.hour()).toBe(8);
    expect(t.minute()).toBe(30);
  });

  it("秒は常に 0 になる", () => {
    expect(parseTime("16:00").second()).toBe(0);
  });

  it("null/undefined を渡すと undefined を返す", () => {
    expect(parseTime(null)).toBeUndefined();
    expect(parseTime(undefined)).toBeUndefined();
  });

  it("空文字を渡すと undefined を返す", () => {
    expect(parseTime("")).toBeUndefined();
  });
});
