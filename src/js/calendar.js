// calendar.js - カレンダー表示と操作に関連する機能を提供

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";

import { getEventType } from "./config.js";
import { getScheduleForDate } from "./calc.js";

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
    eventDidMount: ({ event, el }) => {
      let [title, startTime = "", endTime = ""] = event.title.split("\n");

      // 既存コンテンツをクリア
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }

      // イベントタイトル要素の作成
      const titleElement = document.createElement("div");
      titleElement.className = "event-title";
      titleElement.textContent = title;
      el.appendChild(titleElement);

      // 開始時間の表示（存在する場合）
      if (startTime) {
        const startTimeElement = document.createElement("div");
        startTimeElement.className = "event-time";
        startTimeElement.textContent = startTime;
        el.appendChild(startTimeElement);
      }

      // 終了時間の表示（存在する場合）
      if (endTime) {
        const endTimeElement = document.createElement("div");
        endTimeElement.className = "event-time";
        endTimeElement.textContent = endTime;
        el.appendChild(endTimeElement);
      }
    },
  });
  calendar.render();
  return calendar;
}

// カレンダーの更新
function updateCalendar(currentBaseDate, lastBaseDate) {
  if (!currentBaseDate || !calendar) return;

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

    // イベントの追加
    const { config } = getEventType(subject);
    calendarEvents.push({
      title: config.showTime
        ? `${subject}\n${startTime} - \n${endTime}`
        : subject,
      start: dateStr,
      color: config.color,
    });

    currentDate = currentDate.add(1, "day");
  }
  calendar.removeAllEvents();
  calendar.addEventSource(calendarEvents);
}

// 現在のカレンダーインスタンスを取得
function getCalendar() {
  return calendar;
}

// エクスポート
export { initializeCalendar, updateCalendar, getCalendar };
