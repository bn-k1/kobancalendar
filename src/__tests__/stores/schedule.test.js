// src/__tests__/stores/schedule.test.js
// Characterization tests for schedule store
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import dayjs from "dayjs";
import { useScheduleStore } from "@/stores/schedule";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("useScheduleStore 初期状態", () => {
  it("scheduleDataSets.default の rotationCycleLength は 0", () => {
    const store = useScheduleStore();
    expect(store.scheduleDataSets.default.rotationCycleLength).toBe(0);
  });

  it("scheduleDataSets.next の rotationCycleLength は 0", () => {
    const store = useScheduleStore();
    expect(store.scheduleDataSets.next.rotationCycleLength).toBe(0);
  });

  it("scheduleDataSets の default と next はともに空配列のデータを持つ", () => {
    const store = useScheduleStore();
    expect(store.scheduleDataSets.default.holiday).toEqual([]);
    expect(store.scheduleDataSets.default.saturday).toEqual([]);
    expect(store.scheduleDataSets.default.weekday).toEqual([]);
  });

  it("defaultBaseDate は undefined", () => {
    const store = useScheduleStore();
    expect(store.defaultBaseDate).toBeUndefined();
  });

  it("activeBaseDate は undefined", () => {
    const store = useScheduleStore();
    expect(store.activeBaseDate).toBeUndefined();
  });

  it("nextBaseDate は undefined", () => {
    const store = useScheduleStore();
    expect(store.nextBaseDate).toBeUndefined();
  });

  it("scheduleUpdateDate は undefined", () => {
    const store = useScheduleStore();
    expect(store.scheduleUpdateDate).toBeUndefined();
  });

  it("isDataLoaded は false（cycleLength が 0）", () => {
    const store = useScheduleStore();
    expect(store.isDataLoaded).toBe(false);
  });
});

describe("setScheduleDataSets()", () => {
  it("データセットを上書きできる", () => {
    const store = useScheduleStore();
    const dataSets = {
      default: {
        holiday: [{ s: "公休" }],
        saturday: [{ s: "公休" }],
        weekday: [{ s: "早番", sT: "08:00", eT: "16:00" }],
        rotationCycleLength: 1,
      },
      next: {
        holiday: [],
        saturday: [],
        weekday: [],
        rotationCycleLength: 0,
      },
    };
    store.setScheduleDataSets(dataSets);
    expect(store.scheduleDataSets.default.rotationCycleLength).toBe(1);
    expect(store.scheduleDataSets.default.weekday[0].s).toBe("早番");
  });

  it("isDataLoaded が true になる（default cycleLength > 0）", () => {
    const store = useScheduleStore();
    store.setScheduleDataSets({
      default: { holiday: [], saturday: [], weekday: [], rotationCycleLength: 5 },
      next: { holiday: [], saturday: [], weekday: [], rotationCycleLength: 0 },
    });
    expect(store.isDataLoaded).toBe(true);
  });

  it("isDataLoaded が true になる（next cycleLength > 0）", () => {
    const store = useScheduleStore();
    store.setScheduleDataSets({
      default: { holiday: [], saturday: [], weekday: [], rotationCycleLength: 0 },
      next: { holiday: [], saturday: [], weekday: [], rotationCycleLength: 3 },
    });
    expect(store.isDataLoaded).toBe(true);
  });
});

describe("setDefaultBaseDate() / updateActiveBaseDate() / setNextBaseDate()", () => {
  it("defaultBaseDate をセットできる", () => {
    const store = useScheduleStore();
    const d = dayjs("2025-11-16");
    store.setDefaultBaseDate(d);
    expect(store.defaultBaseDate.isSame(d, "day")).toBe(true);
  });

  it("activeBaseDate を更新できる", () => {
    const store = useScheduleStore();
    const d = dayjs("2025-11-16");
    store.updateActiveBaseDate(d);
    expect(store.activeBaseDate.isSame(d, "day")).toBe(true);
  });

  it("nextBaseDate をセットできる", () => {
    const store = useScheduleStore();
    const d = dayjs("2026-05-16");
    store.setNextBaseDate(d);
    expect(store.nextBaseDate.isSame(d, "day")).toBe(true);
  });
});

describe("setScheduleUpdateDate()", () => {
  it("scheduleUpdateDate をセットできる", () => {
    const store = useScheduleStore();
    const d = dayjs("2026-05-16");
    store.setScheduleUpdateDate(d);
    expect(store.scheduleUpdateDate.isSame(d, "day")).toBe(true);
  });
});
