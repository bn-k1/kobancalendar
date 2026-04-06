// src/__tests__/composables/useSchedule.test.js
// Characterization tests for useSchedule composable
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import dayjs from "dayjs";
import { useSchedule } from "@/composables/useSchedule";
import { useScheduleStore } from "@/stores/schedule";
import { useHolidayStore } from "@/stores/holiday";

// 最小限のスケジュールデータ（cycleLength=5）
const CYCLE = 5;
const makeScheduleData = (cycle = CYCLE) => ({
  holiday: Array.from({ length: cycle }, (_, i) => ({ s: `休日${i}` })),
  saturday: Array.from({ length: cycle }, (_, i) => ({ s: `土曜${i}`, sT: "09:00", eT: "17:00" })),
  weekday: Array.from({ length: cycle }, (_, i) => ({ s: `平日${i}`, sT: "08:00", eT: "16:00" })),
  rotationCycleLength: cycle,
});

function setupStores(options = {}) {
  const scheduleStore = useScheduleStore();
  const holidayStore = useHolidayStore();

  const defaultData = options.defaultData ?? makeScheduleData();
  const nextData = options.nextData ?? makeScheduleData();

  scheduleStore.setScheduleDataSets({ default: defaultData, next: nextData });

  const baseDate = options.baseDate ?? dayjs("2025-11-16");
  const nextBaseDate = options.nextBaseDate ?? baseDate;

  scheduleStore.setDefaultBaseDate(baseDate);
  scheduleStore.updateActiveBaseDate(baseDate);
  scheduleStore.setNextBaseDate(nextBaseDate);

  if (options.scheduleUpdateDate) {
    scheduleStore.setScheduleUpdateDate(options.scheduleUpdateDate);
  }

  // 祝日データ（任意）
  if (options.holidays) {
    holidayStore.setHolidays(options.holidays);
  } else {
    holidayStore.setHolidays({});
  }
}

beforeEach(() => {
  setActivePinia(createPinia());
});

// ---------- calculateShiftIndex ----------

describe("calculateShiftIndex()", () => {
  it("基準日 pos=1 → インデックス 0", () => {
    const { calculateShiftIndex } = useSchedule();
    const data = makeScheduleData(5);
    const base = dayjs("2025-11-17"); // 月曜
    expect(calculateShiftIndex(base, 1, base, data)).toBe(0);
  });

  it("1 日後 pos=1 → インデックス 1", () => {
    const { calculateShiftIndex } = useSchedule();
    const data = makeScheduleData(5);
    const base = dayjs("2025-11-17");
    const target = dayjs("2025-11-18");
    expect(calculateShiftIndex(target, 1, base, data)).toBe(1);
  });

  it("cycleLength 日後 → ラップして 0 に戻る", () => {
    const { calculateShiftIndex } = useSchedule();
    const data = makeScheduleData(5);
    const base = dayjs("2025-11-17");
    const target = dayjs("2025-11-22"); // 5日後
    expect(calculateShiftIndex(target, 1, base, data)).toBe(0);
  });

  it("1 日前 pos=1 → インデックス cycleLength-1（負の剰余を正方向に補正）", () => {
    const { calculateShiftIndex } = useSchedule();
    const data = makeScheduleData(5);
    const base = dayjs("2025-11-17");
    const target = dayjs("2025-11-16"); // 1日前
    expect(calculateShiftIndex(target, 1, base, data)).toBe(4);
  });

  it("pos=3, diff=0 → インデックス 2", () => {
    const { calculateShiftIndex } = useSchedule();
    const data = makeScheduleData(5);
    const base = dayjs("2025-11-17");
    expect(calculateShiftIndex(base, 3, base, data)).toBe(2);
  });

  it("pos=5, diff=1, cycle=5 → ラップして 0", () => {
    const { calculateShiftIndex } = useSchedule();
    const data = makeScheduleData(5);
    const base = dayjs("2025-11-17");
    const target = dayjs("2025-11-18");
    expect(calculateShiftIndex(target, 5, base, data)).toBe(0);
  });

  it("cycleLength=1 のとき常に 0 を返す", () => {
    const { calculateShiftIndex } = useSchedule();
    const data = makeScheduleData(1);
    const base = dayjs("2025-11-17");
    expect(calculateShiftIndex(base, 1, base, data)).toBe(0);
    expect(calculateShiftIndex(dayjs("2025-12-01"), 1, base, data)).toBe(0);
  });
});

// ---------- getScheduleForDate ----------

describe("getScheduleForDate()", () => {
  it("平日は weekday データを返す", () => {
    // 2025-11-17 は月曜（平日、非祝日）
    setupStores({ baseDate: dayjs("2025-11-16"), nextBaseDate: dayjs("2025-11-16") });
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-17"), 1);
    expect(result).not.toBeUndefined();
    expect(result.subject).toMatch(/^平日/);
  });

  it("土曜は saturday データを返す", () => {
    // 2025-11-22 は土曜
    setupStores({ baseDate: dayjs("2025-11-16"), nextBaseDate: dayjs("2025-11-16") });
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-22"), 1);
    expect(result).not.toBeUndefined();
    expect(result.subject).toMatch(/^土曜/);
  });

  it("日曜（祝日扱い）は holiday データを返す", () => {
    // 2025-11-16 は日曜（isSunday → isHoliday）
    setupStores({ baseDate: dayjs("2025-11-16"), nextBaseDate: dayjs("2025-11-16") });
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-16"), 1);
    expect(result).not.toBeUndefined();
    expect(result.subject).toMatch(/^休日/);
    expect(result.isHoliday).toBe(true);
  });

  it("祝日フラグが設定された日は holiday データを返す", () => {
    // 2025-11-17（月曜）を祝日に設定
    setupStores({
      baseDate: dayjs("2025-11-16"),
      nextBaseDate: dayjs("2025-11-16"),
      holidays: { "2025-11-17": "テスト祝日" },
    });
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-17"), 1);
    expect(result.isHoliday).toBe(true);
    expect(result.subject).toMatch(/^休日/);
  });

  it("基準日より前の日付は undefined を返す", () => {
    setupStores({ baseDate: dayjs("2025-11-16"), nextBaseDate: dayjs("2026-05-16") });
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-15"), 1);
    expect(result).toBeUndefined();
  });

  it("baseDate と nextBaseDate が異なる場合、nextBaseDate 以降は undefined を返す", () => {
    setupStores({ baseDate: dayjs("2025-11-16"), nextBaseDate: dayjs("2026-05-16") });
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2026-05-16"), 1);
    expect(result).toBeUndefined();
  });

  it("baseDate と nextBaseDate が同じ場合、nextBaseDate 以降でも undefined にならない", () => {
    setupStores({ baseDate: dayjs("2025-11-16"), nextBaseDate: dayjs("2025-11-16") });
    const { getScheduleForDate } = useSchedule();
    // 基準日と同じ日（日曜・祝日扱い）なので holiday データが返るはず
    const result = getScheduleForDate(dayjs("2025-11-16"), 1);
    expect(result).not.toBeUndefined();
  });

  it("scheduleUpdateDate 以降は next データを使う", () => {
    const defaultData = makeScheduleData(5);
    const nextData = {
      holiday: Array.from({ length: 5 }, (_, i) => ({ s: `次休日${i}` })),
      saturday: Array.from({ length: 5 }, (_, i) => ({ s: `次土曜${i}` })),
      weekday: Array.from({ length: 5 }, (_, i) => ({ s: `次平日${i}` })),
      rotationCycleLength: 5,
    };
    setupStores({
      baseDate: dayjs("2025-11-16"),
      nextBaseDate: dayjs("2025-11-16"),
      defaultData,
      nextData,
      scheduleUpdateDate: dayjs("2026-01-01"),
    });
    const { getScheduleForDate } = useSchedule();
    // 2026-01-01 は木曜・元日（祝日）
    const result = getScheduleForDate(dayjs("2026-01-02"), 1); // 金曜
    expect(result?.subject).toMatch(/^次平日/);
  });

  it("scheduleUpdateDate より前は default データを使う", () => {
    const defaultData = makeScheduleData(5);
    const nextData = {
      holiday: Array.from({ length: 5 }, (_, i) => ({ s: `次休日${i}` })),
      saturday: Array.from({ length: 5 }, (_, i) => ({ s: `次土曜${i}` })),
      weekday: Array.from({ length: 5 }, (_, i) => ({ s: `次平日${i}` })),
      rotationCycleLength: 5,
    };
    setupStores({
      baseDate: dayjs("2025-11-16"),
      nextBaseDate: dayjs("2025-11-16"),
      defaultData,
      nextData,
      scheduleUpdateDate: dayjs("2026-01-01"),
    });
    const { getScheduleForDate } = useSchedule();
    // 2025-11-17 は平日
    const result = getScheduleForDate(dayjs("2025-11-17"), 1);
    expect(result?.subject).toMatch(/^平日/);
  });

  it("shiftIndex を返す", () => {
    setupStores({ baseDate: dayjs("2025-11-17"), nextBaseDate: dayjs("2025-11-17") });
    const { getScheduleForDate } = useSchedule();
    // 基準日当日 pos=1 → shiftIndex=0
    const r0 = getScheduleForDate(dayjs("2025-11-17"), 1);
    expect(r0.shiftIndex).toBe(0);
    // 翌日 pos=1 → shiftIndex=1
    const r1 = getScheduleForDate(dayjs("2025-11-18"), 1);
    expect(r1.shiftIndex).toBe(1);
  });
});

// ---------- calculateScheduleRange ----------

describe("calculateScheduleRange()", () => {
  it("日付範囲のスケジュールを配列で返す（endDate は含まない）", () => {
    setupStores({ baseDate: dayjs("2025-11-17"), nextBaseDate: dayjs("2025-11-17") });
    const { calculateScheduleRange } = useSchedule();
    const result = calculateScheduleRange(
      dayjs("2025-11-17"),
      dayjs("2025-11-20"), // 3日分（17,18,19）
      1,
    );
    expect(result).toHaveLength(3);
  });

  it("各要素に dateStr が含まれる", () => {
    setupStores({ baseDate: dayjs("2025-11-17"), nextBaseDate: dayjs("2025-11-17") });
    const { calculateScheduleRange } = useSchedule();
    const result = calculateScheduleRange(dayjs("2025-11-17"), dayjs("2025-11-19"), 1);
    expect(result[0].dateStr).toBe("2025-11-17");
    expect(result[1].dateStr).toBe("2025-11-18");
  });

  it("スケジュールが undefined になる日はスキップされる", () => {
    // baseDate=2025-11-17, nextBaseDate=2025-11-17+5 → 5日後以降 undefined
    setupStores({
      baseDate: dayjs("2025-11-17"),
      nextBaseDate: dayjs("2025-11-19"), // 17, 18 だけ有効
    });
    const { calculateScheduleRange } = useSchedule();
    const result = calculateScheduleRange(dayjs("2025-11-17"), dayjs("2025-11-22"), 1);
    // 17, 18 が返るはず（19以降は undefined → skip）
    result.forEach((r) => {
      expect(["2025-11-17", "2025-11-18"]).toContain(r.dateStr);
    });
  });
});
