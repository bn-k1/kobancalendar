// src/__tests__/composables/useCalendar.test.js
// Characterization tests for useCalendar composable
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import dayjs from "dayjs";
import { useCalendar } from "@/composables/useCalendar";
import { useCalendarStore } from "@/stores/calendar";
import { useScheduleStore } from "@/stores/schedule";
import { useHolidayStore } from "@/stores/holiday";
import { useEditedSchedules } from "@/composables/useEditedSchedules";

// config/event.json と同等のイベント設定（ordered rule-array 形式）
const EVENT_CONFIG = {
  rules: [
    {
      keywords: ["公休", "法休"],
      color: "red",
      freeAllDay: true,
    },
    { keywords: ["黄"], color: "orange" },
    { keywords: ["空"], color: "deepskyblue" },
  ],
  fallback: { color: "deepskyblue" },
  edited: { color: "magenta" },
};

const CYCLE = 5;
const makeScheduleData = () => ({
  holiday: Array.from({ length: CYCLE }, (_, i) => ({ s: `休日${i}` })),
  saturday: Array.from({ length: CYCLE }, (_, i) => ({
    s: `土曜${i}`,
    sT: "09:00",
    eT: "17:00",
  })),
  weekday: Array.from({ length: CYCLE }, (_, i) => ({
    s: `平日${i}`,
    sT: "08:00",
    eT: "16:00",
  })),
  rotationCycleLength: CYCLE,
});

function setupAll(options = {}) {
  const calendarStore = useCalendarStore();
  const scheduleStore = useScheduleStore();
  const holidayStore = useHolidayStore();
  const editedSchedulesStore = useEditedSchedules();

  calendarStore.setEventConfig(EVENT_CONFIG);
  calendarStore.setStartPosition(options.startPosition ?? 1);

  const data = makeScheduleData();
  const baseDate = options.baseDate ?? dayjs("2025-11-16");
  scheduleStore.setScheduleData({ default: data });
  scheduleStore.setEpochs([{ from: baseDate, dataKey: "default" }]);
  scheduleStore.setActiveEpochIndex(0);

  holidayStore.setHolidays(options.holidays ?? {});
  editedSchedulesStore.initEditedSchedules();
}

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.removeItem("kobancalendar_edited_schedules");
  localStorage.removeItem("kobancalendar_edited_schedules_hidden");
});

// ---------- canAttendMeetup ----------

describe("canAttendMeetup()", () => {
  beforeEach(() => {
    setupAll();
  });

  it("schedule が null/undefined → false", () => {
    const { canAttendMeetup } = useCalendar();
    expect(canAttendMeetup(null, "17:00")).toBe(false);
    expect(canAttendMeetup(undefined, "17:00")).toBe(false);
  });

  it("公休（restDay）→ 常に true", () => {
    const { canAttendMeetup } = useCalendar();
    expect(canAttendMeetup({ subject: "公休", endTime: "" }, "17:00")).toBe(
      true,
    );
  });

  it("法休（restDay）→ 常に true", () => {
    const { canAttendMeetup } = useCalendar();
    expect(canAttendMeetup({ subject: "法休", endTime: "" }, "17:00")).toBe(
      true,
    );
  });

  it("endTime < meetupStartTime → true（終業が集合時刻より前）", () => {
    const { canAttendMeetup } = useCalendar();
    expect(
      canAttendMeetup({ subject: "早番", endTime: "16:00" }, "17:00"),
    ).toBe(true);
  });

  it("endTime === meetupStartTime → false（isBefore なので等しいと false）", () => {
    const { canAttendMeetup } = useCalendar();
    expect(
      canAttendMeetup({ subject: "早番", endTime: "17:00" }, "17:00"),
    ).toBe(false);
  });

  it("endTime > meetupStartTime → false", () => {
    const { canAttendMeetup } = useCalendar();
    expect(
      canAttendMeetup({ subject: "遅番", endTime: "22:00" }, "17:00"),
    ).toBe(false);
  });

  it("endTime が空文字 → false", () => {
    const { canAttendMeetup } = useCalendar();
    expect(canAttendMeetup({ subject: "早番", endTime: "" }, "17:00")).toBe(
      false,
    );
  });

  it("endTime が undefined → false", () => {
    const { canAttendMeetup } = useCalendar();
    expect(canAttendMeetup({ subject: "早番" }, "17:00")).toBe(false);
  });
});

// ---------- generateCalendarEvents ----------

describe("generateCalendarEvents()", () => {
  beforeEach(() => {
    setupAll({ baseDate: dayjs("2025-11-16") });
  });

  it("日付範囲のイベント配列を返す", () => {
    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-20"),
    );
    // 17, 18, 19 の3日分
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.start !== undefined)).toBe(true);
  });

  it("各イベントに color が含まれる", () => {
    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-19"),
    );
    events.forEach((e) => expect(e.color).toBeTruthy());
  });

  it("公休 の色は restDay rule の color", () => {
    const scheduleStore = useScheduleStore();
    const data = {
      holiday: [{ s: "公休" }],
      saturday: [{ s: "公休" }],
      weekday: [{ s: "公休" }],
      rotationCycleLength: 1,
    };
    scheduleStore.setScheduleData({ default: data });

    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    expect(events[0].color).toBe("red");
  });

  it("空 の色は空き番 rule の color", () => {
    const scheduleStore = useScheduleStore();
    const data = {
      holiday: [{ s: "空" }],
      saturday: [{ s: "空" }],
      weekday: [{ s: "空" }],
      rotationCycleLength: 1,
    };
    scheduleStore.setScheduleData({ default: data });

    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    expect(events[0].color).toBe("deepskyblue");
  });

  it("黄番 の色は特番 rule の color", () => {
    const scheduleStore = useScheduleStore();
    const data = {
      holiday: [{ s: "黄番" }],
      saturday: [{ s: "黄番" }],
      weekday: [{ s: "黄番" }],
      rotationCycleLength: 1,
    };
    scheduleStore.setScheduleData({ default: data });

    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    expect(events[0].color).toBe("orange");
  });

  it("どの rule にもマッチしない subject は fallback.color になる", () => {
    const scheduleStore = useScheduleStore();
    const data = {
      holiday: [{ s: "早番" }],
      saturday: [{ s: "早番" }],
      weekday: [{ s: "早番" }],
      rotationCycleLength: 1,
    };
    scheduleStore.setScheduleData({ default: data });

    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    expect(events[0].color).toBe("deepskyblue");
  });

  it("eventConfig が未設定でもエラーにならない", () => {
    const calendarStore = useCalendarStore();
    calendarStore.setEventConfig(undefined);

    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    expect(events[0].color).toBeUndefined();
  });

  it("各イベントの extendedProps.isShift が true", () => {
    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-19"),
    );
    events.forEach((e) => expect(e.extendedProps.isShift).toBe(true));
  });

  it("編集済みスケジュールは isEdited=true で返る", () => {
    const editedStore = useEditedSchedules();
    editedStore.saveEditedSchedule("2025-11-17", {
      subject: "変更済み",
      startTime: "10:00",
      endTime: "18:00",
    });

    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    const edited = events.find((e) => e.extendedProps.isEdited);
    expect(edited).toBeDefined();
    expect(edited.extendedProps.editedSubject).toBe("変更済み");
    expect(edited.color).toBe("magenta");
  });

  it("isEditsHidden=true のとき編集済みスケジュールは通常スケジュールとして表示される", () => {
    const editedStore = useEditedSchedules();
    editedStore.saveEditedSchedule("2025-11-17", { subject: "変更済み" });
    editedStore.setEditsHidden(true);

    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    const notEdited = events.find((e) => e.extendedProps.isEdited === false);
    expect(notEdited).toBeDefined();
  });

  it("時刻情報が無い科目（公休）はタイトルに時刻を含まない", () => {
    // pos=1, 基準日=2025-11-16（日曜）, 休日データの index 0 = '休日0'
    // 「公休」相当のデータを直接 scheduleStore に設定
    const scheduleStore = useScheduleStore();
    const data = {
      holiday: [{ s: "公休" }],
      saturday: [{ s: "公休" }],
      weekday: [{ s: "公休" }],
      rotationCycleLength: 1,
    };
    scheduleStore.setScheduleData({ default: data });

    const { generateCalendarEvents } = useCalendar();
    // 2025-11-17 は平日
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    expect(events[0].title).toBe("公休");
  });

  it("開始・終了時刻がある科目は title に時刻を含む", () => {
    const scheduleStore = useScheduleStore();
    const data = {
      holiday: [{ s: "早番", sT: "08:00", eT: "16:00" }],
      saturday: [{ s: "早番", sT: "08:00", eT: "16:00" }],
      weekday: [{ s: "早番", sT: "08:00", eT: "16:00" }],
      rotationCycleLength: 1,
    };
    scheduleStore.setScheduleData({ default: data });

    const { generateCalendarEvents } = useCalendar();
    const events = generateCalendarEvents(
      dayjs("2025-11-17"),
      dayjs("2025-11-18"),
    );
    expect(events[0].title).toContain("早番");
    expect(events[0].title).toContain("08:00");
  });

  it("calendarStore の calendarEvents も更新される", () => {
    const calendarStore = useCalendarStore();
    const { generateCalendarEvents } = useCalendar();
    generateCalendarEvents(dayjs("2025-11-17"), dayjs("2025-11-19"));
    expect(calendarStore.calendarEvents.length).toBeGreaterThan(0);
  });
});
