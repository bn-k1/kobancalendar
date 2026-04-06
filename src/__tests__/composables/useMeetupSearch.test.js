// src/__tests__/composables/useMeetupSearch.test.js
// Characterization tests for useMeetupSearch composable
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import dayjs from "dayjs";
import { useMeetupSearch } from "@/composables/useMeetupSearch";
import { useCalendarStore } from "@/stores/calendar";
import { useScheduleStore } from "@/stores/schedule";
import { useHolidayStore } from "@/stores/holiday";
import { useEditedSchedules } from "@/stores/editedSchedules";

// 全員が参加可能なデータ（公休 = 休日）
const CYCLE = 3;
const makeScheduleData = () => ({
  holiday: [{ s: "公休" }, { s: "公休" }, { s: "公休" }],
  saturday: [{ s: "公休" }, { s: "早番", sT: "08:00", eT: "16:00" }, { s: "公休" }],
  weekday: [
    { s: "公休" },
    { s: "早番", sT: "08:00", eT: "16:00" },
    { s: "遅番", sT: "14:00", eT: "22:00" },
  ],
  rotationCycleLength: CYCLE,
});

function setupAll(baseDate = dayjs("2025-11-17")) {
  const calendarStore = useCalendarStore();
  const scheduleStore = useScheduleStore();
  const holidayStore = useHolidayStore();
  const editedSchedulesStore = useEditedSchedules();

  const eventConfig = {
    events: {
      restDay: { keywords: ["公休", "法休"], color: "red", showTime: false },
      edited: { keywords: [], color: "magenta", showTime: true },
      default: { keywords: [], color: "deepskyblue", showTime: true },
    },
  };
  calendarStore.setEventConfig(eventConfig);
  calendarStore.setStartPosition(1);

  const data = makeScheduleData();
  scheduleStore.setScheduleDataSets({ default: data, next: data });
  scheduleStore.setDefaultBaseDate(baseDate);
  scheduleStore.updateActiveBaseDate(baseDate);
  scheduleStore.setNextBaseDate(baseDate);

  holidayStore.setHolidays({});
  editedSchedulesStore.initEditedSchedules();
}

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.removeItem("kobancalendar_edited_schedules");
  localStorage.removeItem("kobancalendar_edited_schedules_hidden");
});

describe("findMeetupDates()", () => {
  it("全員参加可能な日は allMatches に含まれる", () => {
    // 2025-11-17 は月曜（平日）。pos=1 → weekday[0] = 公休 → 参加可
    setupAll(dayjs("2025-11-17"));
    const { findMeetupDates } = useMeetupSearch();
    const result = findMeetupDates(
      [1],
      "17:00",
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    expect(result.allMatches).toHaveLength(1);
    expect(result.partialMatches).toHaveLength(0);
  });

  it("誰も参加できない日は結果に含まれない", () => {
    // pos=1, weekday[0]=公休(参加可), pos=2 は weekday[1]=早番(16:00終業, meetup17:00→参加可)
    // pos=3 の weekday[2]=遅番(22:00終業, meetup17:00→参加不可) を確認
    setupAll(dayjs("2025-11-17"));
    const { findMeetupDates } = useMeetupSearch();
    // pos=3 は 1 日目に遅番 → 参加不可
    const result = findMeetupDates(
      [3],
      "17:00",
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    // weekday[2] = 遅番(22:00終業) → 参加不可 → allMatches, partialMatches ともに0
    expect(result.allMatches).toHaveLength(0);
    expect(result.partialMatches).toHaveLength(0);
  });

  it("一部参加可能な日は partialMatches に含まれる", () => {
    // pos=1 → 公休（参加可）, pos=3 → 遅番 22:00（参加不可） → partial
    setupAll(dayjs("2025-11-17"));
    const { findMeetupDates } = useMeetupSearch();
    const result = findMeetupDates(
      [1, 3],
      "17:00",
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    expect(result.partialMatches).toHaveLength(1);
    expect(result.partialMatches[0].availableCount).toBe(1);
    expect(result.partialMatches[0].totalCount).toBe(2);
  });

  it("allMatches は日付昇順でソートされる", () => {
    setupAll(dayjs("2025-11-17"));
    const { findMeetupDates } = useMeetupSearch();
    // pos=1 は連続3日: 公休, 早番(8-16), 遅番(14-22)
    // 公休: 参加可, 早番(16:00→17:00前):参加可, 遅番:参加不可
    const result = findMeetupDates(
      [1],
      "17:00",
      dayjs("2025-11-17"),
      dayjs("2025-11-20"),
    );
    const dates = result.allMatches.map((m) => m.date.format("YYYY-MM-DD"));
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it("partialMatches は参加可能人数降順、次に日付昇順でソートされる", () => {
    setupAll(dayjs("2025-11-17"));
    const { findMeetupDates } = useMeetupSearch();
    const result = findMeetupDates(
      [1, 3],
      "17:00",
      dayjs("2025-11-17"),
      dayjs("2025-11-22"),
    );
    for (let i = 1; i < result.partialMatches.length; i++) {
      const prev = result.partialMatches[i - 1];
      const curr = result.partialMatches[i];
      if (prev.availableCount === curr.availableCount) {
        expect(prev.date.isBefore(curr.date, "day") || prev.date.isSame(curr.date, "day")).toBe(true);
      } else {
        expect(prev.availableCount).toBeGreaterThanOrEqual(curr.availableCount);
      }
    }
  });

  it("空の日付範囲は空の結果を返す", () => {
    setupAll(dayjs("2025-11-17"));
    const { findMeetupDates } = useMeetupSearch();
    const result = findMeetupDates(
      [1],
      "17:00",
      dayjs("2025-11-17"),
      dayjs("2025-11-17"), // startDate === endDate → 0日間
    );
    expect(result.allMatches).toHaveLength(0);
    expect(result.partialMatches).toHaveLength(0);
  });

  it("searchResults ref が更新される", () => {
    setupAll(dayjs("2025-11-17"));
    const { findMeetupDates, searchResults } = useMeetupSearch();
    findMeetupDates([1], "17:00", dayjs("2025-11-17"), dayjs("2025-11-18"));
    expect(searchResults.value.allMatches).toBeDefined();
    expect(searchResults.value.partialMatches).toBeDefined();
  });
});

describe("checkDateForPositions()", () => {
  it("各ポジションの availability と details を返す", () => {
    setupAll(dayjs("2025-11-17"));
    const { checkDateForPositions } = useMeetupSearch();
    const result = checkDateForPositions(
      dayjs("2025-11-17"),
      [1, 2, 3],
      "17:00",
    );
    expect(result.details).toHaveLength(3);
    // pos=1 → 公休 → 参加可
    expect(result.details[0].isAvailable).toBe(true);
    // pos=2 → 早番 16:00 → 17:00 前 → 参加可
    expect(result.details[1].isAvailable).toBe(true);
    // pos=3 → 遅番 22:00 → 参加不可
    expect(result.details[2].isAvailable).toBe(false);
  });

  it("availablePositions に参加可能なポジションのみ含まれる", () => {
    setupAll(dayjs("2025-11-17"));
    const { checkDateForPositions } = useMeetupSearch();
    const result = checkDateForPositions(dayjs("2025-11-17"), [1, 3], "17:00");
    expect(result.availablePositions).toContain(1);
    expect(result.availablePositions).not.toContain(3);
  });
});
