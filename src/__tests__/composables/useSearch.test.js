// src/__tests__/composables/useSearch.test.js
// Characterization tests for the useSearch composable.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import dayjs from "dayjs";
import { useSearch } from "@/composables/useSearch";
import { useScheduleStore } from "@/stores/schedule";

const CYCLE = 3;

// Single-segment fixture: one epoch, one data table.
const makeScheduleData = () => ({
  holiday: [{ s: "休日パトロール" }, { s: "公休" }, { s: "休日パトロール" }],
  saturday: [
    { s: "土曜警邏", sT: "09:00", eT: "17:00" },
    { s: "公休" },
    { s: "土曜警邏", sT: "09:00", eT: "17:00" },
  ],
  weekday: [
    { s: "パトロール", sT: "08:00", eT: "16:00" },
    { s: "事務処理", sT: "08:00", eT: "16:00" },
    { s: "パトロール", sT: "14:00", eT: "22:00" },
  ],
  rotationCycleLength: CYCLE,
});

function setupSingleSegment() {
  const scheduleStore = useScheduleStore();
  scheduleStore.setScheduleData({ default: makeScheduleData() });
  scheduleStore.setEpochs([{ from: dayjs("2025-11-16"), dataKey: "default" }]);
  scheduleStore.setActiveEpochIndex(0);
}

// Two-segment fixture: same epoch anchor/rotation, but the weekday duty name
// is renamed partway through (schedule_update equivalent). segment0 keeps
// the retired name so we can prove search does NOT read it once the swap
// date has passed.
function makeSegmentScheduleData(subject) {
  return {
    holiday: [{ s: "公休" }, { s: "公休" }, { s: "公休" }],
    saturday: [{ s: "公休" }, { s: "公休" }, { s: "公休" }],
    weekday: [
      { s: subject, sT: "08:00", eT: "16:00" },
      { s: "事務処理", sT: "08:00", eT: "16:00" },
      { s: subject, sT: "14:00", eT: "22:00" },
    ],
    rotationCycleLength: CYCLE,
  };
}

function setupTwoSegments() {
  const scheduleStore = useScheduleStore();
  scheduleStore.setScheduleData({
    before: makeSegmentScheduleData("パトロール"),
    after: makeSegmentScheduleData("地域巡回"),
  });
  scheduleStore.setEpochs([
    {
      from: dayjs("2025-11-16"),
      dataKey: "before",
      segments: [
        { from: dayjs("2025-11-16"), dataKey: "before" },
        { from: dayjs("2026-01-01"), dataKey: "after" },
      ],
    },
  ]);
  scheduleStore.setActiveEpochIndex(0);
}

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.useRealTimers();
});

describe("allSuggestions", () => {
  it("selectedDayType の weekday データからユニークな subject を昇順で返す", () => {
    setupSingleSegment();
    const { allSuggestions } = useSearch();
    expect(allSuggestions.value).toEqual(["パトロール", "事務処理"].sort());
  });

  it("updateDayType で saturday に切り替えると saturday の subject を返す", () => {
    setupSingleSegment();
    const { allSuggestions, updateDayType } = useSearch();
    updateDayType("saturday");
    expect(allSuggestions.value).toEqual(["土曜警邏", "公休"].sort());
  });

  it("updateDayType で holiday に切り替えると holiday の subject を返す", () => {
    setupSingleSegment();
    const { allSuggestions, updateDayType } = useSearch();
    updateDayType("holiday");
    expect(allSuggestions.value).toEqual(["休日パトロール", "公休"].sort());
  });
});

describe("filteredSuggestions", () => {
  it("クエリが空なら空配列", () => {
    setupSingleSegment();
    const { filteredSuggestions } = useSearch();
    expect(filteredSuggestions.value).toEqual([]);
  });

  it("大文字小文字を無視した部分一致でフィルタする", () => {
    setupSingleSegment();
    const { searchQuery, filteredSuggestions } = useSearch();
    searchQuery.value = "パト";
    expect(filteredSuggestions.value).toEqual(["パトロール"]);
  });

  it("該当が無ければ空配列", () => {
    setupSingleSegment();
    const { searchQuery, filteredSuggestions } = useSearch();
    searchQuery.value = "存在しない予定名";
    expect(filteredSuggestions.value).toEqual([]);
  });

  it("最大10件に制限する", () => {
    const scheduleStore = useScheduleStore();
    const many = Array.from({ length: 15 }, (_, i) => ({ s: `予定${i}` }));
    scheduleStore.setScheduleData({
      default: {
        holiday: [],
        saturday: [],
        weekday: many,
        rotationCycleLength: many.length,
      },
    });
    scheduleStore.setEpochs([
      { from: dayjs("2025-11-16"), dataKey: "default" },
    ]);
    scheduleStore.setActiveEpochIndex(0);

    const { searchQuery, filteredSuggestions } = useSearch();
    searchQuery.value = "予定";
    expect(filteredSuggestions.value).toHaveLength(10);
  });
});

describe("performSearch()", () => {
  it("一致する予定を position 昇順で searchResults に積む", () => {
    setupSingleSegment();
    const { searchQuery, performSearch, searchResults } = useSearch();
    searchQuery.value = "パトロール";
    performSearch();
    expect(searchResults.value).toEqual([
      {
        subject: "パトロール",
        startTime: "08:00",
        endTime: "16:00",
        position: 1,
        dayType: "weekday",
      },
      {
        subject: "パトロール",
        startTime: "14:00",
        endTime: "22:00",
        position: 3,
        dayType: "weekday",
      },
    ]);
  });

  it("hasSearched を true にする", () => {
    setupSingleSegment();
    const { searchQuery, performSearch, hasSearched } = useSearch();
    expect(hasSearched.value).toBe(false);
    searchQuery.value = "パトロール";
    performSearch();
    expect(hasSearched.value).toBe(true);
  });

  it("クエリが空なら searchResults を空にする（hasSearched は true になる）", () => {
    setupSingleSegment();
    const { searchQuery, performSearch, searchResults, hasSearched } =
      useSearch();
    searchQuery.value = "   ";
    performSearch();
    expect(searchResults.value).toEqual([]);
    expect(hasSearched.value).toBe(true);
  });

  it("該当なしなら空配列", () => {
    setupSingleSegment();
    const { searchQuery, performSearch, searchResults } = useSearch();
    searchQuery.value = "存在しない予定名";
    performSearch();
    expect(searchResults.value).toEqual([]);
  });

  it("updateDayType は既存クエリがあれば自動で再検索する", () => {
    setupSingleSegment();
    const { searchQuery, performSearch, updateDayType, searchResults } =
      useSearch();
    searchQuery.value = "公休";
    performSearch();
    expect(searchResults.value).toEqual([]); // weekday に「公休」は無い

    updateDayType("saturday");
    expect(searchResults.value).toHaveLength(1);
    expect(searchResults.value[0].dayType).toBe("saturday");
  });
});

describe("clearSearch() / resetSearch()", () => {
  it("clearSearch はクエリ・結果・hasSearched をリセットする", () => {
    setupSingleSegment();
    const {
      searchQuery,
      performSearch,
      clearSearch,
      searchResults,
      hasSearched,
    } = useSearch();
    searchQuery.value = "パトロール";
    performSearch();

    clearSearch();
    expect(searchQuery.value).toBe("");
    expect(searchResults.value).toEqual([]);
    expect(hasSearched.value).toBe(false);
  });

  it("resetSearch はさらに selectedDayType も weekday に戻す", () => {
    setupSingleSegment();
    const { selectedDayType, updateDayType, resetSearch } = useSearch();
    updateDayType("holiday");
    expect(selectedDayType.value).toBe("holiday");

    resetSearch();
    expect(selectedDayType.value).toBe("weekday");
  });
});

// ---------- segment-aware resolution (the bug this test file guards) ----------

describe("epoch 内データ切替（segment）を跨いだ検索", () => {
  it("切替日より前の今日は先頭セグメント（旧名）で検索できる", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-31T00:00:00+09:00"));
    setupTwoSegments();

    const { searchQuery, performSearch, searchResults, allSuggestions } =
      useSearch();
    expect(allSuggestions.value).toContain("パトロール");
    expect(allSuggestions.value).not.toContain("地域巡回");

    searchQuery.value = "パトロール";
    performSearch();
    expect(searchResults.value).toHaveLength(2);
  });

  it("切替日以降の今日は後続セグメント（新名）で検索できる — 旧名はヒットしない", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T00:00:00+09:00"));
    setupTwoSegments();

    const { searchQuery, performSearch, searchResults, allSuggestions } =
      useSearch();
    // Suggestions must reflect today's segment, not segment0.
    expect(allSuggestions.value).toContain("地域巡回");
    expect(allSuggestions.value).not.toContain("パトロール");

    // Searching the current name finds the shifts.
    searchQuery.value = "地域巡回";
    performSearch();
    expect(searchResults.value).toHaveLength(2);

    // Searching the retired name must NOT yield a stale hit from segment0.
    searchQuery.value = "パトロール";
    performSearch();
    expect(searchResults.value).toEqual([]);
  });
});
