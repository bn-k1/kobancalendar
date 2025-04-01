// calendar.js - カレンダー表示と操作に関連する機能を提供

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";

import { getEventType, isConfigLoaded } from "./store.js";
import { getScheduleForDate } from "./store.js";

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

    eventContent: (arg) => {
      let [title, startTime = "", endTime = ""] = arg.event.title.split("\n");

      return {
        html: `
          <div class="event-title">${title}</div>
          ${startTime ? `<div class="event-time">${startTime}</div>` : ""}
          ${endTime ? `<div class="event-time">${endTime}</div>` : ""}
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
  const calendarEvents = [];

  const today = dayjs().startOf("day");

  // 表示範囲の日付を順に処理
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
      isHoliday: isHolidayFlag,
      isSaturday,
    } = scheduleInfo;

    // カレンダーセルのスタイル設定
    const calendarCell = document.querySelector(`[data-date='${dateStr}']`);
    if (calendarCell) {
      calendarCell.classList.remove("holiday", "fc-day-sat", "fc-day-sun");

      if (isHolidayFlag) {
        calendarCell.classList.add("holiday");
      }
      if (isSaturday) {
        calendarCell.classList.add("fc-day-sat");
      }
      if (currentDate.day() === 0) {
        calendarCell.classList.add("fc-day-sun");
      }
      if (currentDate.isSame(today, "day")) {
        calendarCell.classList.add("today-highlight");
      }
    }

    try {
      // イベントの追加 - ここでエラーが発生する可能性がある
      const { config } = getEventType(subject);
      calendarEvents.push({
        title: config.showTime
          ? `${subject}\n${startTime} - \n${endTime}`
          : subject,
        start: dateStr,
        color: config.color,
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

  // イベントの更新
  calendar.removeAllEvents();
  calendar.addEventSource(calendarEvents);
}

// 現在のカレンダーインスタンスを取得
function getCalendar() {
  return calendar;
}

// エクスポート
export { initializeCalendar, updateCalendar, getCalendar };
