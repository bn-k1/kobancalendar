// calendar/index.js - カレンダーモジュールのメインエントリーポイント

import { initializeCalendar } from "./initialization.js";
import { updateCalendar } from "./eventHandler.js";
import { applyDayCellStyles } from "./cellStyle.js";

// カレンダービューの更新（再レンダリングなしでビューを更新）
function refreshCalendarView() {
  const calendar = getCalendar();
  if (calendar) {
    calendar.render();
    // 日付セルのスタイルを適用
    setTimeout(applyDayCellStyles, 0);
  }
}

// 現在のカレンダーインスタンスを取得（initialization.jsから提供される）
function getCalendar() {
  return window.calendarInstance;
}

// エクスポート
export { initializeCalendar, updateCalendar, refreshCalendarView, getCalendar };
