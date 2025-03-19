// schedule.js - スケジュール計算とカレンダー表示に関連する機能を提供

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { memoize } from "lodash";

import { getEventType } from "./config.js";
import { isHoliday, allHolidays } from "./data-loader.js";

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
  // データが変更されたのでメモ化関数のキャッシュをクリア
  getScheduleForDate.cache.clear();
}

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

// 任意の日付とコマ位置から勤務内容を返す - 元の実装
function _getScheduleForDate(
  targetDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  const dateStr = targetDate.format("YYYY-MM-DD");
  const isHolidayFlag = isHoliday(targetDate);
  const isSaturday = targetDate.day() === 6; // day()は0が日曜、6が土曜
  const formattedCurrentBaseDate = currentBaseDate.format("YYYY-MM-DD");
  const formattedLastBaseDate = lastBaseDate.format("YYYY-MM-DD");

  // 日付が基準範囲外の場合
  if (
    (currentBaseDate.unix() !== lastBaseDate.unix() &&
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
  const daysDifference = targetDate.diff(currentBaseDate, "day");
  const adjustedStartPosition = startPosition - 1; //これしかない
  const shiftIndex =
    (((adjustedStartPosition + daysDifference) %
      scheduleData.rotationCycleLength) +
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

// memoizeを使用してパフォーマンスを向上
// カスタムリゾルバを使用して複数のパラメータから一意のキーを生成
const getScheduleForDate = memoize(
  _getScheduleForDate,
  (targetDate, startPosition, currentBaseDate, lastBaseDate) => {
    return `${targetDate.format("YYYY-MM-DD")}_${startPosition}_${currentBaseDate.format(
      "YYYY-MM-DD",
    )}_${lastBaseDate.format("YYYY-MM-DD")}`;
  },
);

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

      if (!currentDate.isSame(today, "day")) {
        if (isHolidayFlag) {
          calendarCell.classList.add("holiday");
        }
        if (isSaturday) {
          calendarCell.classList.add("fc-day-sat");
        }
        if (currentDate.day() === 0) {
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

    currentDate = currentDate.add(1, "day");
  }
  calendar.removeAllEvents();
  calendar.addEventSource(calendarEvents);
}

// CSVエクスポート機能
function exportCSV(months, startPosition, currentBaseDate, lastBaseDate) {
  const startDate = dayjs().startOf("day");
  const endDate = startDate.add(months, "month");

  let csvContent = "Subject,Start Date,Start Time,End Time\n";

  // 日付範囲を順に処理
  let currentDate = startDate;
  while (currentDate.isBefore(endDate)) {
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

    const { subject, startTime, endTime } = scheduleInfo;
    const formattedDate = currentDate.format("YYYY/MM/DD");

    csvContent += `${subject},${formattedDate},${startTime},${endTime}\n`;

    currentDate = currentDate.add(1, "day");
  }

  // CSVファイルのダウンロード
  const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([BOM, csvContent], { type: "text/csv;charset=utf-8" });

  const url = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const currentDateStr = dayjs().format("YYYY-MM-DD");
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
