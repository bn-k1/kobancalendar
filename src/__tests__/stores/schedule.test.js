// src/__tests__/stores/schedule.test.js
// Characterization tests for schedule store (epoch model)
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import dayjs from "dayjs";
import { useScheduleStore } from "@/stores/schedule";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("useScheduleStore 初期状態", () => {
  it("epochs は空配列", () => {
    const store = useScheduleStore();
    expect(store.epochs).toEqual([]);
  });

  it("scheduleData は空オブジェクト", () => {
    const store = useScheduleStore();
    expect(store.scheduleData).toEqual({});
  });

  it("activeEpochIndex は 0", () => {
    const store = useScheduleStore();
    expect(store.activeEpochIndex).toBe(0);
  });

  it("isDataLoaded は false（データ未ロード）", () => {
    const store = useScheduleStore();
    expect(store.isDataLoaded).toBe(false);
  });
});

describe("setScheduleData()", () => {
  it("データを上書きできる", () => {
    const store = useScheduleStore();
    store.setScheduleData({
      default: {
        holiday: [{ s: "公休" }],
        saturday: [{ s: "公休" }],
        weekday: [{ s: "早番", sT: "08:00", eT: "16:00" }],
        rotationCycleLength: 1,
      },
    });
    expect(store.scheduleData.default.rotationCycleLength).toBe(1);
    expect(store.scheduleData.default.weekday[0].s).toBe("早番");
  });

  it("rotationCycleLength > 0 のフォルダがあれば isDataLoaded は true", () => {
    const store = useScheduleStore();
    store.setScheduleData({
      default: {
        holiday: [],
        saturday: [],
        weekday: [],
        rotationCycleLength: 5,
      },
    });
    expect(store.isDataLoaded).toBe(true);
  });

  it("全フォルダが rotationCycleLength 0 なら isDataLoaded は false", () => {
    const store = useScheduleStore();
    store.setScheduleData({
      default: {
        holiday: [],
        saturday: [],
        weekday: [],
        rotationCycleLength: 0,
      },
    });
    expect(store.isDataLoaded).toBe(false);
  });

  it("オブジェクトでない値は空オブジェクトに正規化される", () => {
    const store = useScheduleStore();
    store.setScheduleData(null);
    expect(store.scheduleData).toEqual({});
  });
});

describe("setEpochs()", () => {
  it("epoch リストをセットできる", () => {
    const store = useScheduleStore();
    store.setEpochs([
      { from: dayjs("2025-11-16"), dataKey: "default" },
      { from: dayjs("2026-05-16"), dataKey: "default" },
    ]);
    expect(store.epochs).toHaveLength(2);
    expect(store.epochs[0].dataKey).toBe("default");
    expect(store.epochs[1].from.isSame(dayjs("2026-05-16"), "day")).toBe(true);
  });

  it("配列でない値は空配列に正規化される", () => {
    const store = useScheduleStore();
    store.setEpochs(undefined);
    expect(store.epochs).toEqual([]);
  });
});

describe("setActiveEpochIndex()", () => {
  it("active epoch index を更新できる", () => {
    const store = useScheduleStore();
    store.setActiveEpochIndex(2);
    expect(store.activeEpochIndex).toBe(2);
  });
});
