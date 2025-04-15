// calendar.js - カレンダー管理関連の機能
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Alpine from "alpinejs";
import dayjs from "dayjs";
import memoize from "lodash.memoize";
import { handleError } from "./utils.js";
import { CALENDAR_CONFIG, ERROR_MESSAGES } from "./constants.js";

// カレンダーの初期化
export function initializeCalendar(initialDate = null) {
  const calendarEl = document.getElementById("calendar");

  // カレンダーコンフィグを作成
  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: CALENDAR_CONFIG.INITIAL_VIEW,
    initialDate: initialDate ? initialDate.toDate() : undefined,
    locale: CALENDAR_CONFIG.LOCALE,
    events: [],
    aspectRatio: CALENDAR_CONFIG.DEFAULT_ASPECT_RATIO,
    height: CALENDAR_CONFIG.HEIGHT,

    // 日付セルのクラス名をカスタマイズ
    dayCellClassNames: (arg) => {
      return getDayCellClassNames(arg.date, (date) =>
        Alpine.store("state").isHoliday(date),
      );
    },

    // イベントコンテンツをカスタマイズ
    eventContent: (arg) => {
      return createEventContent(arg, (date) =>
        Alpine.store("state").getHolidayName(date),
      );
    },
  });

  calendar.render();
  return calendar;
}

// カレンダーの更新
export function updateCalendar(
  calendar,
  startPosition,
  currentBaseDate = Alpine.store("state").currentBaseDate,
  lastBaseDate = Alpine.store("state").lastBaseDate,
) {
  if (!calendar) return;

  if (!Alpine.store("state").isConfigLoaded()) {
    handleError(
      new Error(ERROR_MESSAGES.CONFIG_NOT_LOADED),
      ERROR_MESSAGES.CONFIG_NOT_LOADED,
      false,
    );
    return;
  }

  const viewStartDate = dayjs(calendar.view.activeStart);
  const viewEndDate = dayjs(calendar.view.activeEnd);

  // イベントデータを効率的に一括処理
  const calendarEvents = generateCalendarEvents(
    viewStartDate,
    viewEndDate,
    startPosition,
    currentBaseDate,
    lastBaseDate,
  );

  // イベントの一括更新
  calendar.removeAllEvents();
  calendar.addEventSource(calendarEvents);
}

// 日付セルのクラス名を生成する関数
function getDayCellClassNames(date, isHolidayFn) {
  const classNames = [];
  const dateObj = dayjs(date);

  if (isHolidayFn(dateObj)) {
    classNames.push("holiday");
  }
  if (dateObj.day() === 6) {
    classNames.push("fc-day-sat");
  }
  if (dateObj.day() === 0) {
    classNames.push("fc-day-sun");
  }

  if (dateObj.isSame(dayjs().startOf("day"), "day")) {
    classNames.push("today-highlight");
  }

  return classNames;
}

// イベントコンテンツの生成関数
function createEventContent(arg, getHolidayNameFn) {
  let [title, startTime = "", endTime = ""] = arg.event.title.split("\n");

  const { shiftIndex } = arg.event.extendedProps;
  const dateObj = dayjs(arg.event.start);

  const holidayName = getHolidayNameFn(dateObj);

  const metaInfo = holidayName
    ? `${shiftIndex + 1} ${holidayName}`
    : `${shiftIndex + 1}`;

  return {
    html: `
      <div class="event-title">${title}</div>
      ${startTime ? `<div class="event-time">${startTime}</div>` : ""}
      ${endTime ? `<div class="event-time">${endTime}</div>` : ""}
      <div class="event-meta">${metaInfo}</div>
    `,
  };
}

// 日付範囲のイベントデータを生成
function generateCalendarEvents(
  viewStartDate,
  viewEndDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  const calendarEvents = [];

  // getScheduleForDateをメモ化
  const memoizedGetSchedule = memoize(
    (dateStr, startPos, currentBaseDateStr) => {
      return Alpine.store("state").getScheduleForDate(
        dayjs(dateStr),
        startPos,
        dayjs(currentBaseDateStr),
        lastBaseDate,
      );
    },
    // キャッシュキー生成関数
    (dateStr, startPos, currentBaseDateStr) => {
      return `${dateStr}_${startPos}_${currentBaseDateStr}`;
    },
  );

  let currentDate = viewStartDate;
  while (currentDate.isBefore(viewEndDate)) {
    // メモ化した関数を使用
    const scheduleInfo = memoizedGetSchedule(
      currentDate.format("YYYY-MM-DD"),
      startPosition,
      currentBaseDate.format("YYYY-MM-DD"),
    );

    if (!scheduleInfo) {
      currentDate = currentDate.add(1, "day");
      continue;
    }

    const {
      dateStr,
      subject,
      startTime,
      endTime,
      isHoliday,
      isSaturday,
      shiftIndex,
    } = scheduleInfo;

    const { config } = Alpine.store("state").getEventType(subject);
    calendarEvents.push({
      title: config.showTime
        ? `${subject}\n${startTime} - \n${endTime}`
        : subject,
      start: dateStr,
      color: config.color,
      extendedProps: {
        startTime,
        endTime,
        isShift: true,
        isHoliday,
        isSaturday,
        shiftIndex,
      },
    });
    currentDate = currentDate.add(1, "day");
  }

  return calendarEvents;
}
