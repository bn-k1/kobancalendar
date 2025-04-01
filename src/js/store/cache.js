// store/cache.js - キャッシュ管理機能
import { getState, setState, initializeCache as initCache } from "./state.js";

/**
 * スケジュールデータの設定
 * @param {Object} data - スケジュールデータオブジェクト
 */
function setScheduleData(data) {
  setState("scheduleData", data);
  clearScheduleCache();
}

/**
 * スケジュールキャッシュのクリア
 */
function clearScheduleCache() {
  if (!getState("scheduleCache")) {
    initCache();
  } else {
    getState("scheduleCache").clear();
  }
}

/**
 * キャッシュの初期化 - state.jsからの再エクスポート
 */
function initializeCache() {
  initCache();
}

export { setScheduleData, clearScheduleCache, initializeCache };
