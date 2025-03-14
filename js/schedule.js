// schedule.js - スケジュール計算とカレンダー表示に関連する機能を提供

import { getEventType } from "./config.js";
import { isHoliday, allHolidays } from "./data-loader.js";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

let calendar;
let scheduleData = {
  holiday: [],
  saturday: [],
  weekday: [],
  rotationCycleLength: 0,
};

// スケジュールデータの設定
function setScheduleData(shiftData) {
  scheduleData = shiftData;
}

// カレンダーの初期化
function initializeCalendar(updateCallback) {
  let calendarElement = document.getElementById("calendar");
  calendar = new FullCalendar.Calendar(calendarElement, {
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

// 日付を統一形式で文字列に変換する共通関数
function formatDateToString(date) {
  return date
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
}

// 任意の日付とコマ位置から勤務内容を返す
function getScheduleForDate(
  targetDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  const dateStr = formatDateToString(targetDate);
  const isHolidayFlag = isHoliday(targetDate);
  const isSaturday = targetDate.getDay() === 6;
  const formattedCurrentBaseDate = formatDateToString(currentBaseDate);
  const formattedLastBaseDate = formatDateToString(lastBaseDate);

  // 日付が基準範囲外の場合
  if (
    (currentBaseDate.getTime() !== lastBaseDate.getTime() &&
      dateStr >= formattedLastBaseDate) ||
    dateStr < formattedCurrentBaseDate
  ) {
    return {
      dateStr,
      subject: "-",
      startTime: "",
      endTime: "",
      isHoliday: isHolidayFlag,
      isSaturday,
    };
  }

  // 日付差分から勤務位置を計算
  const daysDifference = Math.floor(
    (targetDate - currentBaseDate) / MILLISECONDS_PER_DAY,
  );
  const shiftIndex =
    (((startPosition + daysDifference) % scheduleData.rotationCycleLength) +
      scheduleData.rotationCycleLength) %
    scheduleData.rotationCycleLength;

  // 曜日タイプに基づくデータ選択
  let shiftData;
  if (isHolidayFlag) {
    shiftData = scheduleData.holiday[shiftIndex];
  } else if (isSaturday) {
    shiftData = scheduleData.saturday[shiftIndex];
  } else {
    shiftData = scheduleData.weekday[shiftIndex];
  }

  if (!shiftData) return null;

  const [subject, startTime, endTime] = shiftData.split(",");
  return {
    dateStr,
    subject,
    startTime,
    endTime,
    isHoliday: isHolidayFlag,
    isSaturday,
  };
}

// カレンダーの更新
function updateCalendar(currentBaseDate, lastBaseDate) {
  if (
    !currentBaseDate ||
    scheduleData.holiday.length === 0 ||
    scheduleData.saturday.length === 0 ||
    scheduleData.weekday.length === 0
  )
    return;

  const startPosition = parseInt(document.getElementById("startNumber").value);
  const viewStartDate = calendar.view.activeStart;
  const viewEndDate = calendar.view.activeEnd;
  const calendarEvents = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 表示範囲の日付を順に処理
  for (
    let currentDate = new Date(viewStartDate);
    currentDate < viewEndDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const scheduleInfo = getScheduleForDate(
      currentDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    );
    if (!scheduleInfo) continue;

    const {
      dateStr,
      subject,
      startTime,
      endTime,
      isHoliday: isHolidayFlag,
      isSaturday,
    } = scheduleInfo;

    const dateWithZeroTime = new Date(currentDate);
    dateWithZeroTime.setHours(0, 0, 0, 0);

    // カレンダーセルのスタイル設定
    const calendarCell = document.querySelector(`[data-date='${dateStr}']`);
    if (calendarCell) {
      calendarCell.classList.remove("holiday", "fc-day-sat", "fc-day-sun");

      if (dateWithZeroTime.getTime() !== today.getTime()) {
        if (isHolidayFlag) {
          calendarCell.classList.add("holiday");
        }
        if (isSaturday) {
          calendarCell.classList.add("fc-day-sat");
        }
        if (currentDate.getDay() === 0) {
          calendarCell.classList.add("fc-day-sun");
        }
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
  }
  calendar.removeAllEvents();
  calendar.addEventSource(calendarEvents);
}

// CSVエクスポート機能
function exportCSV(months, startPosition, currentBaseDate, lastBaseDate) {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + months);

  let csvContent = "Subject,Start Date,Start Time,End Time\n";

  // 日付範囲を順に処理
  for (
    let currentDate = new Date(startDate);
    currentDate < endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const scheduleInfo = getScheduleForDate(
      currentDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    );
    if (!scheduleInfo) continue;

    const { subject, startTime, endTime } = scheduleInfo;
    const formattedDate = `${currentDate.getFullYear()}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getDate().toString().padStart(2, "0")}`;

    csvContent += `${subject},${formattedDate},${startTime},${endTime}\n`;
  }

  // CSVファイルのダウンロード
  const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([BOM, csvContent], { type: "text/csv;charset=utf-8" });

  const url = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const currentDateStr = new Date().toISOString().split("T")[0];
  downloadLink.href = url;
  downloadLink.download = `schedule_${currentDateStr}.csv`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(url);
}

// エクスポート
export {
  setScheduleData,
  initializeCalendar,
  updateCalendar,
  getScheduleForDate,
  exportCSV,
};
