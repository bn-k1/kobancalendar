// store/index.js - メインエントリーポイント
import {
  getState,
  setState,
  updateCurrentBaseDate,
  isConfigLoaded,
  setScheduleData,
  clearScheduleCache,
  initializeCache,
} from "./state.js";
import { setHolidays, isHoliday, getHolidayName } from "./holidays.js";
import { getEventType } from "./events.js";
import {
  calculateShiftIndex,
  getScheduleForDate,
  calculateScheduleRange,
} from "./schedule.js";

// 全機能をエクスポート
export {
  // state.js
  getState,
  setState,
  updateCurrentBaseDate,
  isConfigLoaded,
  setScheduleData,
  clearScheduleCache,
  initializeCache,

  // holidays.js
  setHolidays,
  isHoliday,
  getHolidayName,

  // events.js
  getEventType,

  // schedule.js
  calculateShiftIndex,
  getScheduleForDate,
  calculateScheduleRange,
};
