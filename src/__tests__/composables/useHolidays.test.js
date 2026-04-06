// src/__tests__/composables/useHolidays.test.js
// Characterization tests for useHolidays composable
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useHolidays } from "@/composables/useHolidays";
import { useHolidayStore } from "@/stores/holiday";
import { CUSTOM_HOLIDAY } from "@/utils/constants";

beforeEach(() => {
  setActivePinia(createPinia());
});

// ---------- addUserDefinedHolidays ----------

describe("addUserDefinedHolidays()", () => {
  it("MM-DD 形式のカスタム祝日を指定年範囲で展開する", () => {
    const { addUserDefinedHolidays } = useHolidays();
    const holidays = {};
    addUserDefinedHolidays(holidays, ["08-12"], 2025, 1);
    // 2024, 2025, 2026 の 08-12 が追加される
    expect(holidays["2024-08-12"]).toBe(CUSTOM_HOLIDAY);
    expect(holidays["2025-08-12"]).toBe(CUSTOM_HOLIDAY);
    expect(holidays["2026-08-12"]).toBe(CUSTOM_HOLIDAY);
  });

  it("既存の祝日は上書きしない", () => {
    const { addUserDefinedHolidays } = useHolidays();
    const holidays = { "2025-08-12": "既存祝日" };
    addUserDefinedHolidays(holidays, ["08-12"], 2025, 1);
    expect(holidays["2025-08-12"]).toBe("既存祝日");
  });

  it("複数のカスタム祝日を処理する", () => {
    const { addUserDefinedHolidays } = useHolidays();
    const holidays = {};
    addUserDefinedHolidays(holidays, ["08-12", "08-13"], 2025, 0);
    expect(holidays["2025-08-12"]).toBe(CUSTOM_HOLIDAY);
    expect(holidays["2025-08-13"]).toBe(CUSTOM_HOLIDAY);
  });

  it("yearsRange=0 のとき currentYear だけ追加される", () => {
    const { addUserDefinedHolidays } = useHolidays();
    const holidays = {};
    addUserDefinedHolidays(holidays, ["08-12"], 2025, 0);
    expect(Object.keys(holidays)).toHaveLength(1);
    expect(holidays["2025-08-12"]).toBe(CUSTOM_HOLIDAY);
  });
});

// ---------- fetchHolidays ----------

describe("fetchHolidays()", () => {
  it("元日（1月1日）が含まれる", () => {
    const { fetchHolidays } = useHolidays();
    const holidays = fetchHolidays(0, []);
    const currentYear = new Date().getFullYear();
    expect(holidays[`${currentYear}-01-01`]).toBeTruthy();
  });

  it("既知の祝日 2024-01-01 が 元日 として含まれる", () => {
    const { fetchHolidays } = useHolidays();
    // yearsRange を広げて 2024 をカバーする
    const holidays = fetchHolidays(5, []);
    expect(holidays["2024-01-01"]).toBe("元日");
  });

  it("カスタム祝日を含む場合も正しく取得する", () => {
    const { fetchHolidays } = useHolidays();
    const currentYear = new Date().getFullYear();
    const holidays = fetchHolidays(0, ["08-12"]);
    expect(holidays[`${currentYear}-08-12`]).toBe(CUSTOM_HOLIDAY);
  });

  it("空のカスタム祝日でもクラッシュしない", () => {
    const { fetchHolidays } = useHolidays();
    expect(() => fetchHolidays(0, [])).not.toThrow();
  });
});

// ---------- isHoliday / getHolidayName ----------

describe("isHoliday()", () => {
  it("日曜は常に holiday として扱われる", () => {
    // 2025-11-16 は日曜
    const store = useHolidayStore();
    store.setHolidays({});
    const { isHoliday } = useHolidays();
    expect(isHoliday("2025-11-16")).toBe(true);
  });

  it("祝日マップにある日は holiday", () => {
    const store = useHolidayStore();
    store.setHolidays({ "2025-11-17": "テスト祝日" });
    const { isHoliday } = useHolidays();
    expect(isHoliday("2025-11-17")).toBe(true);
  });

  it("平日・非祝日は false", () => {
    const store = useHolidayStore();
    store.setHolidays({});
    const { isHoliday } = useHolidays();
    // 2025-11-17 は月曜
    expect(isHoliday("2025-11-17")).toBe(false);
  });

  it("土曜は（祝日マップになければ）false", () => {
    const store = useHolidayStore();
    store.setHolidays({});
    const { isHoliday } = useHolidays();
    // 2025-11-22 は土曜
    expect(isHoliday("2025-11-22")).toBe(false);
  });
});

describe("getHolidayName()", () => {
  it("祝日マップにある日は名前を返す", () => {
    const store = useHolidayStore();
    store.setHolidays({ "2025-01-01": "元日" });
    const { getHolidayName } = useHolidays();
    expect(getHolidayName("2025-01-01")).toBe("元日");
  });

  it("マップにない日は undefined を返す", () => {
    const store = useHolidayStore();
    store.setHolidays({});
    const { getHolidayName } = useHolidays();
    expect(getHolidayName("2025-11-17")).toBeUndefined();
  });
});

// ---------- loadHolidays ----------

describe("loadHolidays()", () => {
  it("ストアの holidays が更新される", () => {
    const holidayStore = useHolidayStore();
    holidayStore.setHolidayYearsRange(0);
    holidayStore.setUserDefinedHolidays([]);
    const { loadHolidays, allHolidays } = useHolidays();
    loadHolidays();
    expect(Object.keys(allHolidays.value).length).toBeGreaterThan(0);
  });

  it("isHolidaysLoaded が true になる", () => {
    const holidayStore = useHolidayStore();
    holidayStore.setHolidayYearsRange(0);
    holidayStore.setUserDefinedHolidays([]);
    const { loadHolidays, isHolidaysLoaded } = useHolidays();
    loadHolidays();
    expect(isHolidaysLoaded.value).toBe(true);
  });
});
