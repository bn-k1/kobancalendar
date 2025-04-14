// calendar.js - カレンダー管理関連の機能
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Alpine from "alpinejs";
import dayjs from "dayjs";
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
    // datesSetイベントハンドラを削除
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

  // カスタムのdatesSetイベントハンドラを追加
  calendar.on("datesSet", () => {
    // 日付セルのスタイルを適用
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

// 日付セルのスタイルを適用する関数
function customizeDayCell(date, el, isHolidayFn) {
  const dateObj = dayjs(date);

  // 土曜、日曜、祝日のスタイルを設定
  if (isHolidayFn(dateObj)) {
    el.classList.add("holiday");
  }
  if (dateObj.day() === 6) {
    // 土曜日
    el.classList.add("fc-day-sat");
  }
  if (dateObj.day() === 0) {
    // 日曜日
    el.classList.add("fc-day-sun");
  }

  // 今日の日付をハイライト
  if (dateObj.isSame(dayjs().startOf("day"), "day")) {
    el.classList.add("today-highlight");
  }
}
