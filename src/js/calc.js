// calc.js - スケジュール計算・データ処理に関連する機能を提供

import {
  setScheduleData,
  getScheduleForDate,
  calculateScheduleRange,
  clearScheduleCache,
} from "./store.js";

// 定数
const MAX_CACHE_SIZE = 1000;

// エクスポート
export {
  setScheduleData,
  getScheduleForDate,
  calculateScheduleRange,
  clearScheduleCache,
  MAX_CACHE_SIZE,
};
