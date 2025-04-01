// calendar/cellStyle.js - 日付セルのスタイリング機能

import dayjs from "dayjs";
import { isHoliday } from "../store/index.js";

// 日付セルのスタイル適用
function customizeDayCell(date, el) {
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
}

// カレンダー内のすべての日付セルにスタイルを適用する関数
function applyDayCellStyles() {
  const calendar = window.calendarInstance;
  if (!calendar) return;

  // 現在表示されているすべての日付セルを取得
  const dayCells = document.querySelectorAll(".fc-daygrid-day");

  dayCells.forEach((cell) => {
    // データ属性から日付を取得
    const dateStr = cell.getAttribute("data-date");
    if (dateStr) {
      const date = new Date(dateStr);
      customizeDayCell(date, cell);
    }
  });
}

export { customizeDayCell, applyDayCellStyles };
