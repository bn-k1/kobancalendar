// calendar/eventHandler.js - イベント表示と操作の機能

import dayjs from "dayjs";
import {
  getEventType,
  isConfigLoaded,
  getScheduleForDate,
} from "../store/index.js";

// カレンダーの更新
function updateCalendar(currentBaseDate, lastBaseDate) {
  const calendar = window.calendarInstance;
  if (!currentBaseDate || !calendar) return;

  // 設定が読み込まれていることを確認
  if (!isConfigLoaded()) {
    console.warn(
      "設定が完全に読み込まれていません。カレンダー更新をスキップします。",
    );
    return;
  }

  const startPosition = parseInt(document.getElementById("startNumber").value);
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

// 日付範囲のイベントデータを生成する関数
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
    const scheduleInfo = getScheduleForDate(
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

    try {
      // イベントの準備
      const { config } = getEventType(subject);
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
    } catch (error) {
      console.error(
        `日付 ${dateStr} のイベント処理中にエラーが発生しました:`,
        error,
      );
      // エラーが発生しても処理を続行
    }

    currentDate = currentDate.add(1, "day");
  }

  return calendarEvents;
}

export { updateCalendar, generateCalendarEvents };
