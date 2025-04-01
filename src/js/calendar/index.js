// calendar/index.js - カレンダーモジュールのメインエントリーポイント

import { initializeCalendar } from "./initialization.js";
import { updateCalendar } from "./eventHandler.js";
import { getState } from "../store/index.js";
import { getCalendarInstance } from "./calendarService.js";

// カレンダービューの更新（再レンダリングなしでビューを更新）
function refreshCalendarView() {
  const calendar = getCalendarInstance();
  if (calendar) {
    calendar.render();
  }
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
  getCalendarInstance,
  handleCalendarUpdate,
};
