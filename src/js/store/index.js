// store/index.js - メインエントリーポイント
import {
  getState,
  setState,
  updateCurrentBaseDate,
  isConfigLoaded,
} from "./state.js";
import { setHolidays, isHoliday, getHolidayName } from "./holidays.js";
import { getEventType } from "./events.js";
import {
  setScheduleData,
  clearScheduleCache,
  initializeCache,
} from "./cache.js";
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

  // holidays.js
  setHolidays,
  isHoliday,
  getHolidayName,

  // events.js
  getEventType,

  // cache.js
  setScheduleData,
  clearScheduleCache,
  initializeCache,

  // schedule.js
  calculateShiftIndex,
  getScheduleForDate,
  calculateScheduleRange,
};
