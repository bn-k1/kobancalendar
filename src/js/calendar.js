// calendar.js - カレンダー表示と操作に関連する機能を提供

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";

import {
  getEventType,
  isConfigLoaded,
  getScheduleForDate,
  isHoliday,
  getHolidayName,
} from "./store.js";

let calendar;

// カレンダーの初期化
function initializeCalendar(updateCallback) {
  let calendarElement = document.getElementById("calendar");

  calendar = new Calendar(calendarElement, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    locale: "ja",
    events: [],
    datesSet: updateCallback,
    aspectRatio: 1.35,
    height: "auto",

    // FullCalendarのAPIを使用してセルの表示をカスタマイズ
    dayCellDidMount: (info) => {
      const { date, el } = info;
      const dateObj = dayjs(date);

      // 土曜、日曜、祝日のスタイルを設定
      if (isHoliday(dateObj)) {
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
    },

    // イベントコンテンツのカスタマイズ
    eventContent: (arg) => {
      let [title, startTime = "", endTime = ""] = arg.event.title.split("\n");

      // extendedPropsからデバッグ情報を取得
      const { shiftIndex, isHoliday } = arg.event.extendedProps;
      const dateObj = dayjs(arg.event.start);

      // 祝日名を取得
      const holidayName = getHolidayName(dateObj);

      // デバッグ情報の文字列を作成（土日の表示は排除）
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
    },
  });

  calendar.render();
  return calendar;
}

// カレンダーの更新
function updateCalendar(currentBaseDate, lastBaseDate) {
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

// カレンダーの表示を更新（再レンダリングなしでビューを更新）
function refreshCalendarView() {
  if (calendar) {
    calendar.render();
  }
}

// 現在のカレンダーインスタンスを取得
function getCalendar() {
  return calendar;
}

// エクスポート
export { initializeCalendar, updateCalendar, refreshCalendarView, getCalendar };
