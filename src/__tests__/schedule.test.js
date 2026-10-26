// Shift math, day-type lookup, epoch windows, holidays and meetup availability.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import dayjs from "dayjs";
import { useSchedule } from "@/composables/useSchedule";
import { useHolidays, CUSTOM_HOLIDAY } from "@/composables/useHolidays";
import { useMeetupSearch } from "@/composables/useMeetupSearch";
import { useCalendar } from "@/composables/useCalendar";
import { useLocalParams } from "@/composables/useLocalParams";
import { buildEpochs } from "@/composables/useAppInitializer";

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
function load(epochs = [["2025-11-17", "a"]], { active } = {}) {
  const raw = epochs.map(([from, data]) => ({
    from,
    segments: Array.isArray(data)
      ? data.map(([f, d]) => ({ from: f, data: d }))
      : [{ from, data }],
  }));
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
    // 2025-11-24 (Mon) = 勤労感謝の日の振替休日
    const result = load().getScheduleForDate(dayjs("2025-11-24"), 1);
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

  it.each([
    ["b= が現行世代", [["2025-11-17", "a"]], "2025-11-17", "2025-11-17"],
    ["b= が次世代", null, "2026-01-05", "2026-01-05"],
    ["b= が現行世代（次世代あり）", null, "2025-11-17", "2025-11-17"],
    ["b= が知らない世代", null, "2025-06-01", null],
    ["b= が日付でない", null, "x", null],
    ["b= なし・2026-05-16 が無い（旧URLは読み替えない）", null, null, null],
  ])("URL の世代解決: %s", (_, epochs, b, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-01T00:00:00+09:00"));
    const { resolveLinkedBaseDate } = load(epochs ?? two);
    expect(resolveLinkedBaseDate(b)?.format("YYYY-MM-DD") ?? null).toBe(
      expected,
    );
  });

  // b= の無い旧URLはすべて 2026-05-16 世代で作られた。
  it.each([
    ["世代が1つ", "2026-10-19", [["2026-05-16", "a"]], "2026-05-16"],
    [
      "実施前の次世代あり",
      "2026-10-19",
      [
        ["2026-05-16", "a"],
        ["2026-11-16", "a"],
      ],
      "2026-05-16",
    ],
    [
      "次世代の実施後",
      "2026-11-16",
      [
        ["2026-05-16", "a"],
        ["2026-11-16", "a"],
      ],
      null,
    ],
  ])("b= なしのURL: %s", (_, now, epochs, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${now}T12:00:00+09:00`));
    const { resolveLinkedBaseDate } = load(epochs);
    expect(resolveLinkedBaseDate(null)?.format("YYYY-MM-DD") ?? null).toBe(
      expected,
    );
  });

  it("世代の終わりは次世代の from", () => {
    const { epochEndFor } = load(two);
    expect(epochEndFor(dayjs("2025-11-17")).format("YYYY-MM-DD")).toBe(
      "2026-01-05",
    );
    expect(epochEndFor(dayjs("2026-01-05"))).toBeUndefined();
  });
});

describe("世代内の表差し替え", () => {
  it("差し替えがあれば最後の差し替え日を返す", () => {
    const s = load([
      [
        "2025-11-17",
        [
          ["2025-11-17", "a"],
          ["2025-12-01", "b"],
        ],
      ],
    ]);
    expect(s.activeTableSwapDate.value.format("YYYY-MM-DD")).toBe("2025-12-01");
  });

  it("差し替えがなければ null", () => {
    expect(load().activeTableSwapDate.value).toBeNull();
  });
});

describe("祝日", () => {
  it.each([
    ["2026-01-01", "元日"],
    ["2025-11-24", "振替休日"],
    ["2026-08-13", CUSTOM_HOLIDAY],
    // Far from today: no precomputed year window any more.
    ["2040-08-14", CUSTOM_HOLIDAY],
    ["2040-01-01", "元日"],
  ])("%s は %s", (date, name) => {
    const { isHoliday, getHolidayName } = useHolidays();
    expect(getHolidayName(date)).toBe(name);
    expect(isHoliday(date)).toBe(true);
  });

  it("平日は祝日でなく、日曜は名前なしで休日", () => {
    const { isHoliday, getHolidayName } = useHolidays();
    expect(isHoliday("2026-10-27")).toBe(false);
    expect(getHolidayName("2026-10-25")).toBeUndefined();
    expect(isHoliday("2026-10-25")).toBe(true);
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

  it("名前はコマ位置と同じ並びで詳細に載る（同じコマでも取り違えない）", () => {
    load();
    const { details } = useMeetupSearch().checkDateForPositions(
      dayjs("2025-11-17"),
      [2, 2, 3],
      "17:00",
      ["山田", "中野"],
    );
    expect(details.map((d) => d.name)).toEqual(["山田", "中野", ""]);
  });
});

describe("飲みに行くンダーの保存", () => {
  beforeEach(() => localStorage.clear());

  it("名前はコマ位置と一緒に世代ごとに保存され、未選択の行は落とす", () => {
    const { saveMeetupParams, loadMeetupParamsFor } = useLocalParams();
    saveMeetupParams(
      "2026-05-16",
      [
        { position: 5, name: " 山田 " },
        { position: "", name: "未選択" },
        { position: 9, name: "" },
      ],
      "19:00",
      90,
    );
    expect(loadMeetupParamsFor("2026-05-16").participants).toEqual([
      { position: 5, name: "山田" },
      { position: 9, name: "" },
    ]);
  });

  it("名前が無い旧形式のセットも読める", () => {
    localStorage.setItem(
      "kobancalendar.savedMeetup.v1",
      JSON.stringify({
        active: "2026-05-16",
        sets: {
          "2026-05-16": {
            participants: [5, 9],
            startTime: "19:00",
            period: 30,
          },
        },
      }),
    );
    expect(
      useLocalParams().loadMeetupParamsFor("2026-05-16").participants,
    ).toEqual([
      { position: 5, name: "" },
      { position: 9, name: "" },
    ]);
  });
});
