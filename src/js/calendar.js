// calendar.js - カレンダー管理関連の機能
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Alpine from "alpinejs";
import dayjs from "dayjs";
import { handleError } from "./error-handler.js";
import { CALENDAR_CONFIG, ERROR_MESSAGES } from "./constants.js";

// カレンダーの初期化
export function initializeCalendar(initialDate = null) {
  const calendarEl = document.getElementById("calendar");

  // イベントコンテンツレンダラーを作成
  const eventContentRenderer = (info) =>
    createEventContent(info, (date) =>
      Alpine.store("state").getHolidayName(date),
    );

  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: CALENDAR_CONFIG.INITIAL_VIEW,
    initialDate: initialDate ? initialDate.toDate() : undefined,
    locale: CALENDAR_CONFIG.LOCALE,
    events: [],
    aspectRatio: CALENDAR_CONFIG.DEFAULT_ASPECT_RATIO,
    height: CALENDAR_CONFIG.HEIGHT,

    dayCellClassNames: (arg) => {
      return getDayCellClassNames(arg.date, (date) =>
        Alpine.store("state").isHoliday(date),
      );
    },

    eventContent: eventContentRenderer,
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

  const calendarEvents = generateCalendarEvents(
    viewStartDate,
    viewEndDate,
    startPosition,
    currentBaseDate,
    lastBaseDate,
  );

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

  const container = document.createElement("div");

  const titleEl = document.createElement("div");
  titleEl.className = "event-title";
  titleEl.textContent = title;
  container.appendChild(titleEl);

  if (startTime) {
    const startTimeEl = document.createElement("div");
    startTimeEl.className = "event-time";
    startTimeEl.textContent = startTime;
    container.appendChild(startTimeEl);
  }

  if (endTime) {
    const endTimeEl = document.createElement("div");
    endTimeEl.className = "event-time";
    endTimeEl.textContent = endTime;
    container.appendChild(endTimeEl);
  }

  const metaEl = document.createElement("div");
  metaEl.className = "event-meta";
  metaEl.textContent = metaInfo;
  container.appendChild(metaEl);

  return { domNodes: [container] };
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

  let currentDate = viewStartDate;
  while (currentDate.isBefore(viewEndDate)) {
    const scheduleInfo = Alpine.store("state").getScheduleForDate(
      currentDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
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
