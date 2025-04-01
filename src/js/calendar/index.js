// calendar/index.js - カレンダーモジュールのメインエントリーポイント

import { initializeCalendar } from "./initialization.js";
import { updateCalendar } from "./eventHandler.js";
import { getState } from "../store/index.js";

// カレンダービューの更新（再レンダリングなしでビューを更新）
function refreshCalendarView() {
  const calendar = getCalendar();
  if (calendar) {
    calendar.render();
  }
}

// 現在のカレンダーインスタンスを取得（initialization.jsから提供される）
function getCalendar() {
  return window.calendarInstance;
}

function handleCalendarUpdate() {
  // カレンダー更新時にリフレッシュも実行
  updateCalendar(getState("currentBaseDate"), getState("lastBaseDate"));
  refreshCalendarView();
}

// エクスポート
export {
  initializeCalendar,
  updateCalendar,
  refreshCalendarView,
  getCalendar,
  handleCalendarUpdate,
};
