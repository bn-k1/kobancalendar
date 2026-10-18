// Shift math, day-type lookup, epoch windows, holidays and meetup availability.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import dayjs from "dayjs";
import { useSchedule } from "@/composables/useSchedule";
import { useHolidays } from "@/composables/useHolidays";
import { useMeetupSearch } from "@/composables/useMeetupSearch";
import { useCalendar } from "@/composables/useCalendar";
import { buildEpochs } from "@/composables/useAppInitializer";
import { useHolidayStore } from "@/stores/holiday";
import { CUSTOM_HOLIDAY } from "@/utils/constants";

// 3-slot rotation. Subjects carry the day type; "公休" matches the freeAllDay
// rule by substring. `prefix` tells folders apart.
const table = (p = "") => ({
  holiday: [{ s: `${p}日公休` }, { s: `${p}日公休` }, { s: `${p}日公休` }],
  saturday: [
    { s: `${p}土公休` },
    { s: `${p}土早`, sT: "08:00", eT: "16:00" },
    { s: `${p}土公休` },
  ],
  weekday: [
    { s: `${p}平公休` },
    { s: `${p}平早`, sT: "08:00", eT: "16:00" },
    { s: `${p}平遅`, sT: "14:00", eT: "22:00" },
  ],
  rotationCycleLength: 3,
});

// epochs in the scheduleData.json shape: [from, data] or [from, [[from, data], ...]]
function load(epochs = [["2025-11-17", "a"]], { active, holidays = {} } = {}) {
  const raw = epochs.map(([from, data]) => ({
    from,
    segments: Array.isArray(data)
      ? data.map(([f, d]) => ({ from: f, data: d }))
      : [{ from, data }],
  }));
  useHolidayStore().setHolidays(holidays);
  useCalendar().setEventConfig({
    rules: [{ keywords: ["公休"], color: "#ff0000", freeAllDay: true }],
  });
  const schedule = useSchedule();
  schedule.loadSchedule(buildEpochs(raw), { a: table(), b: table("新") });
  if (active) schedule.updateActiveBaseDate(active);
  return schedule;
}

beforeEach(() => setActivePinia(createPinia()));
afterEach(() => vi.useRealTimers());

describe("コマ計算", () => {
  // 2025-11-17 = Mon
  it.each([
    ["基準日 pos1", "2025-11-17", 1, 0],
    ["翌日", "2025-11-18", 1, 1],
    ["1周してラップ", "2025-11-20", 1, 0],
    ["基準日より前は負方向にラップ", "2025-11-16", 1, 2],
    ["pos3 の翌日", "2025-11-18", 3, 0],
  ])("%s", (_, date, pos, index) => {
    const { calculateShiftIndex } = useSchedule();
    expect(
      calculateShiftIndex(dayjs(date), pos, dayjs("2025-11-17"), table()),
    ).toBe(index);
  });

  it.each([
    ["平日", "2025-11-17", "平公休"],
    ["平日の翌日", "2025-11-18", "平早"],
    ["土曜", "2025-12-06", "土早"],
    ["日曜", "2025-11-23", "日公休"],
  ])("%s の表を引く", (_, date, subject) => {
    expect(load().getScheduleForDate(dayjs(date), 1).subject).toBe(subject);
  });

  it("祝日は holiday の表を引く", () => {
    const result = load(undefined, {
      holidays: { "2025-11-18": "祝" },
    }).getScheduleForDate(dayjs("2025-11-18"), 1);
    expect(result).toMatchObject({ isHoliday: true, subject: "日公休" });
  });
});

describe("世代", () => {
  const two = [
    ["2025-11-17", "a"],
    ["2026-01-05", "b"],
  ];

  it("表示窓は [from, 次世代の from)", () => {
    const s = load(two, { active: dayjs("2025-11-17") });
    expect(s.getScheduleForDate(dayjs("2025-11-16"), 1)).toBeUndefined();
    expect(s.getScheduleForDate(dayjs("2026-01-04"), 1)).toBeDefined();
    expect(s.getScheduleForDate(dayjs("2026-01-05"), 1)).toBeUndefined();
  });

  it("後続世代を選ぶとその世代のデータ・アンカーで計算する", () => {
    const result = load(two, {
      active: dayjs("2026-01-05"),
    }).getScheduleForDate(dayjs("2026-01-05"), 1);
    expect(result).toMatchObject({ shiftIndex: 0, subject: "新平公休" });
  });

  it("世代内データ切替: 表だけ差し替わり、回転位相は連続する", () => {
    const s = load([
      [
        "2025-11-17",
        [
          ["2025-11-17", "a"],
          ["2025-12-01", "b"],
        ],
      ],
    ]);
    const before = s.getScheduleForDate(dayjs("2025-11-30"), 1);
    const after = s.getScheduleForDate(dayjs("2025-12-01"), 1);
    expect(after.shiftIndex).toBe((before.shiftIndex + 1) % 3);
    expect(before.subject).not.toMatch(/^新/);
    expect(after.subject).toMatch(/^新/);
  });

  it.each([
    ["今日以前で最後の世代", "2026-02-01", "2026-01-05", undefined],
    ["次世代が未来", "2025-12-01", "2025-11-17", "2026-01-05"],
    ["全世代が未来なら先頭", "2020-01-01", "2025-11-17", "2026-01-05"],
  ])("current epoch: %s", (_, now, current, next) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${now}T00:00:00+09:00`));
    const { defaultBaseDate, nextBaseDate } = load(two);
    expect(defaultBaseDate.value.format("YYYY-MM-DD")).toBe(current);
    expect(nextBaseDate.value?.format("YYYY-MM-DD")).toBe(next);
  });
});

describe("独自休日", () => {
  it("MM-DD を年範囲に展開し、既存の祝日は上書きしない", () => {
    const holidays = { "2025-08-13": "既存" };
    useHolidays().addUserDefinedHolidays(holidays, ["08-13"], 2025, 1);
    expect(holidays).toEqual({
      "2024-08-13": CUSTOM_HOLIDAY,
      "2025-08-13": "既存",
      "2026-08-13": CUSTOM_HOLIDAY,
    });
  });
});

describe("飲みに行くンダー", () => {
  // 2025-11-17 (Mon): pos1=公休, pos2=早(16:00まで), pos3=遅(22:00まで)
  it("公休・終業が開始前なら参加可、終業が後なら不可", () => {
    load();
    const { details } = useMeetupSearch().checkDateForPositions(
      dayjs("2025-11-17"),
      [1, 2, 3],
      "17:00",
    );
    expect(details.map((d) => d.isAvailable)).toEqual([true, true, false]);
  });

  it("全員参加は allMatches、一部参加は partialMatches", () => {
    load();
    const { findMeetupDates } = useMeetupSearch();
    const day = [dayjs("2025-11-17"), dayjs("2025-11-18")];
    expect(findMeetupDates([1, 2], "17:00", ...day).allMatches).toHaveLength(1);
    const partial = findMeetupDates([1, 3], "17:00", ...day).partialMatches;
    expect(partial).toHaveLength(1);
    expect(partial[0]).toMatchObject({ availableCount: 1, totalCount: 2 });
  });
});
