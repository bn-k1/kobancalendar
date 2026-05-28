// src/__tests__/composables/useSchedule.test.js
// Characterization tests for useSchedule composable (epoch model)
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import dayjs from "dayjs";
import { useSchedule } from "@/composables/useSchedule";
import { useScheduleStore } from "@/stores/schedule";
import { useHolidayStore } from "@/stores/holiday";

// 最小限のスケジュールデータ（cycleLength=5）
const CYCLE = 5;
const makeScheduleData = (cycle = CYCLE, prefix = "") => ({
  holiday: Array.from({ length: cycle }, (_, i) => ({
    s: `${prefix}休日${i}`,
  })),
  saturday: Array.from({ length: cycle }, (_, i) => ({
    s: `${prefix}土曜${i}`,
    sT: "09:00",
    eT: "17:00",
  })),
  weekday: Array.from({ length: cycle }, (_, i) => ({
    s: `${prefix}平日${i}`,
    sT: "08:00",
    eT: "16:00",
  })),
  rotationCycleLength: cycle,
});

/**
 * Set up the schedule store with an epoch timeline.
 * @param {Object} options
 * @param {Array} options.epochs - [{ from: dayjs, dataKey: string }]
 *   (default: single epoch at 2025-11-16 / "default")
 * @param {Object} options.scheduleData - { [dataKey]: data }
 *   (default: { default: makeScheduleData() })
 * @param {number} options.activeEpochIndex - default 0
 * @param {Object} options.holidays
 */
function setupStores(options = {}) {
  const scheduleStore = useScheduleStore();
  const holidayStore = useHolidayStore();

  const scheduleData = options.scheduleData ?? { default: makeScheduleData() };
  const epochs = options.epochs ?? [
    { from: dayjs("2025-11-16"), dataKey: "default" },
  ];

  scheduleStore.setScheduleData(scheduleData);
  scheduleStore.setEpochs(epochs);
  scheduleStore.setActiveEpochIndex(options.activeEpochIndex ?? 0);

  holidayStore.setHolidays(options.holidays ?? {});
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
    setupStores();
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-17"), 1);
    expect(result).not.toBeUndefined();
    expect(result.subject).toMatch(/^平日/);
  });

  it("土曜は saturday データを返す", () => {
    // 2025-11-22 は土曜
    setupStores();
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-22"), 1);
    expect(result).not.toBeUndefined();
    expect(result.subject).toMatch(/^土曜/);
  });

  it("日曜（祝日扱い）は holiday データを返す", () => {
    // 2025-11-16 は日曜（isSunday → isHoliday）
    setupStores();
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-16"), 1);
    expect(result).not.toBeUndefined();
    expect(result.subject).toMatch(/^休日/);
    expect(result.isHoliday).toBe(true);
  });

  it("祝日フラグが設定された日は holiday データを返す", () => {
    // 2025-11-17（月曜）を祝日に設定
    setupStores({ holidays: { "2025-11-17": "テスト祝日" } });
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-17"), 1);
    expect(result.isHoliday).toBe(true);
    expect(result.subject).toMatch(/^休日/);
  });

  it("active epoch の from より前の日付は undefined を返す", () => {
    setupStores({
      epochs: [
        { from: dayjs("2025-11-16"), dataKey: "default" },
        { from: dayjs("2026-05-16"), dataKey: "default" },
      ],
      activeEpochIndex: 0,
    });
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2025-11-15"), 1);
    expect(result).toBeUndefined();
  });

  it("後続の世代がある場合、その from 以降は undefined を返す", () => {
    setupStores({
      epochs: [
        { from: dayjs("2025-11-16"), dataKey: "default" },
        { from: dayjs("2026-05-16"), dataKey: "default" },
      ],
      activeEpochIndex: 0,
    });
    const { getScheduleForDate } = useSchedule();
    const result = getScheduleForDate(dayjs("2026-05-16"), 1);
    expect(result).toBeUndefined();
  });

  it("後続の世代が無ければ上限なし（最終世代）", () => {
    setupStores({
      epochs: [
        { from: dayjs("2025-11-16"), dataKey: "default" },
        { from: dayjs("2026-05-16"), dataKey: "default" },
      ],
      activeEpochIndex: 1,
    });
    const { getScheduleForDate } = useSchedule();
    // 最終世代を選択中。from 以降ずっと表示される
    const result = getScheduleForDate(dayjs("2027-01-01"), 1);
    expect(result).not.toBeUndefined();
  });

  it("後続世代を選択するとその世代のデータを使う", () => {
    setupStores({
      scheduleData: {
        default: makeScheduleData(5),
        next: makeScheduleData(5, "次"),
      },
      epochs: [
        { from: dayjs("2025-11-16"), dataKey: "default" },
        { from: dayjs("2026-01-01"), dataKey: "next" },
      ],
      activeEpochIndex: 1,
    });
    const { getScheduleForDate } = useSchedule();
    // 2026-01-02 は金曜
    const result = getScheduleForDate(dayjs("2026-01-02"), 1);
    expect(result?.subject).toMatch(/^次平日/);
  });

  it("現世代を選択すると現世代のデータを使う", () => {
    setupStores({
      scheduleData: {
        default: makeScheduleData(5),
        next: makeScheduleData(5, "次"),
      },
      epochs: [
        { from: dayjs("2025-11-16"), dataKey: "default" },
        { from: dayjs("2026-01-01"), dataKey: "next" },
      ],
      activeEpochIndex: 0,
    });
    const { getScheduleForDate } = useSchedule();
    // 2025-11-17 は平日
    const result = getScheduleForDate(dayjs("2025-11-17"), 1);
    expect(result?.subject).toMatch(/^平日/);
  });

  it("shiftIndex を返す", () => {
    setupStores({
      epochs: [{ from: dayjs("2025-11-17"), dataKey: "default" }],
    });
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
    setupStores({
      epochs: [{ from: dayjs("2025-11-17"), dataKey: "default" }],
    });
    const { calculateScheduleRange } = useSchedule();
    const result = calculateScheduleRange(
      dayjs("2025-11-17"),
      dayjs("2025-11-20"), // 3日分（17,18,19）
      1,
    );
    expect(result).toHaveLength(3);
  });

  it("各要素に dateStr が含まれる", () => {
    setupStores({
      epochs: [{ from: dayjs("2025-11-17"), dataKey: "default" }],
    });
    const { calculateScheduleRange } = useSchedule();
    const result = calculateScheduleRange(
      dayjs("2025-11-17"),
      dayjs("2025-11-19"),
      1,
    );
    expect(result[0].dateStr).toBe("2025-11-17");
    expect(result[1].dateStr).toBe("2025-11-18");
  });

  it("スケジュールが undefined になる日はスキップされる", () => {
    // active epoch 2025-11-17、後続世代 2025-11-19 → 17, 18 だけ有効
    setupStores({
      epochs: [
        { from: dayjs("2025-11-17"), dataKey: "default" },
        { from: dayjs("2025-11-19"), dataKey: "default" },
      ],
      activeEpochIndex: 0,
    });
    const { calculateScheduleRange } = useSchedule();
    const result = calculateScheduleRange(
      dayjs("2025-11-17"),
      dayjs("2025-11-22"),
      1,
    );
    result.forEach((r) => {
      expect(["2025-11-17", "2025-11-18"]).toContain(r.dateStr);
    });
  });
});

// ---------- epoch resolution (today-dependent) ----------

describe("世代の解決（today 依存）", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaultBaseDate は today 以前で最後の世代、nextBaseDate はその次", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-14T00:00:00+09:00"));
    setupStores({
      epochs: [
        { from: dayjs("2025-10-16"), dataKey: "default" },
        { from: dayjs("2025-11-16"), dataKey: "default" },
        { from: dayjs("2026-05-16"), dataKey: "default" },
      ],
    });
    const { defaultBaseDate, nextBaseDate } = useSchedule();
    expect(defaultBaseDate.value.isSame(dayjs("2025-11-16"), "day")).toBe(true);
    expect(nextBaseDate.value.isSame(dayjs("2026-05-16"), "day")).toBe(true);
  });

  it("最終世代が現世代なら nextBaseDate は undefined", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00+09:00"));
    setupStores({
      epochs: [
        { from: dayjs("2025-11-16"), dataKey: "default" },
        { from: dayjs("2026-05-16"), dataKey: "default" },
      ],
    });
    const { defaultBaseDate, nextBaseDate } = useSchedule();
    expect(defaultBaseDate.value.isSame(dayjs("2026-05-16"), "day")).toBe(true);
    expect(nextBaseDate.value).toBeUndefined();
  });

  it("updateActiveBaseDate は from が一致する世代を active にする", () => {
    setupStores({
      epochs: [
        { from: dayjs("2025-11-16"), dataKey: "default" },
        { from: dayjs("2026-05-16"), dataKey: "default" },
      ],
      activeEpochIndex: 0,
    });
    const { updateActiveBaseDate, activeBaseDate } = useSchedule();
    updateActiveBaseDate(dayjs("2026-05-16"));
    expect(activeBaseDate.value.isSame(dayjs("2026-05-16"), "day")).toBe(true);
    // 未知の日付は無視（active は変わらない）
    updateActiveBaseDate(dayjs("2099-01-01"));
    expect(activeBaseDate.value.isSame(dayjs("2026-05-16"), "day")).toBe(true);
  });
});
