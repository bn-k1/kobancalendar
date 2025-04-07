// calendar.js - カレンダー管理関連の機能
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Alpine from "alpinejs";
import dayjs from "dayjs";
import { customizeDayCell } from "./ui-utils.js";
import { createEventContentRenderer } from "./event-service.js";
import { handleError } from "./error-handler.js";
import { CALENDAR_CONFIG, ERROR_MESSAGES } from "./constants.js";

// カレンダーの初期化
export function initializeCalendar() {
  const calendarEl = document.getElementById("calendar");

  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: CALENDAR_CONFIG.INITIAL_VIEW,
    locale: CALENDAR_CONFIG.LOCALE,
    events: [],
    datesSet: () => updateCalendar(calendar),
    aspectRatio: CALENDAR_CONFIG.DEFAULT_ASPECT_RATIO,
    height: CALENDAR_CONFIG.HEIGHT,

    // セルのカスタマイズ
    dayCellDidMount: (info) => {
      const { date, el } = info;
      customizeDayCell(date, el, (date) =>
        Alpine.store("state").isHoliday(date),
      );
    },

    // イベントコンテンツのカスタマイズ
    eventContent: createEventContentRenderer((date) =>
      Alpine.store("state").getHolidayName(date),
    ),
  });

  calendar.render();

  // 月が変わった時にも日付セルのスタイルを適用
  calendar.on("datesSet", () => {
    applyDayCellStyles(calendar);
  });

  return calendar;
}

// カレンダーの更新
export function updateCalendar(
  calendar,
  startPosition = 1,
  currentBaseDate = Alpine.store("state").currentBaseDate,
  lastBaseDate = Alpine.store("state").lastBaseDate,
) {
  if (!calendar) return;

  // 設定が読み込まれていることを確認
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

  // イベントデータを一度にまとめて準備
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

// カレンダー内のすべての日付セルにスタイルを適用
function applyDayCellStyles(calendar) {
  if (!calendar) return;

  // 現在表示されているすべての日付セルを取得
  const dayCells = document.querySelectorAll(".fc-daygrid-day");

  dayCells.forEach((cell) => {
    // データ属性から日付を取得
    const dateStr = cell.getAttribute("data-date");
    if (dateStr) {
      const date = dayjs(dateStr);
      customizeDayCell(date, cell, (date) =>
        Alpine.store("state").isHoliday(date),
      );
    }
  });
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

    // イベントの準備
    const { config } = Alpine.store("state").getEventType(subject);
    calendarEvents.push({
      title: config.showTime
        ? `${subject}\n${startTime} - \n${endTime}`
        : subject,
      start: dateStr,
      color: config.color,
      // 追加のメタデータ
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
