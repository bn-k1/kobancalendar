// store/state.js - 基本的な状態管理機能
import { LRUCache } from "lru-cache";

// ストア内部の状態オブジェクト - プライベート
const _state = {
  // スケジュールに関するデータ
  scheduleData: {
    holiday: [],
    saturday: [],
    weekday: [],
    rotationCycleLength: 0,
  },

  // 日付・基準日
  baseDates: [],
  currentBaseDate: null,
  lastBaseDate: null,

  // 設定
  holidayYearsRange: 0,
  maxCacheSize: 0,
  userDefinedHolidays: [],
  icsExportConfig: {},

  // イベント設定
  eventConfig: null,

  // 祝日
  allHolidays: {},

  // キャッシュ（実際のサイズはconfigで初期化される）
  scheduleCache: null,
};

/**
 * 状態値の取得
 * @param {string} key - 取得する状態のキー
 * @returns {any} - 状態の値
 */
function getState(key) {
  if (key in _state) {
    return _state[key];
  }
  console.warn(`状態キー '${key}' が存在しません`);
  return undefined;
}

/**
 * 状態値の更新
 * @param {string} key - 更新する状態のキー
 * @param {any} value - 新しい値
 */
function setState(key, value) {
  if (key in _state) {
    _state[key] = value;

    // maxCacheSizeが更新された場合、キャッシュを再初期化
    if (key === "maxCacheSize" && _state.scheduleCache) {
      initializeCache();
    }

    return true;
  }
  console.warn(`存在しない状態キー '${key}' への更新をスキップしました`);
  return false;
}

/**
 * 基準日の更新
 * @param {dayjs} newBaseDate - 新しい基準日
 * @returns {dayjs} 更新された基準日
 */
function updateCurrentBaseDate(newBaseDate) {
  _state.currentBaseDate = newBaseDate;
  return _state.currentBaseDate;
}

/**
 * 設定が完全に読み込まれたかチェックする
 * @returns {boolean} 設定が読み込まれているかどうか
 */
function isConfigLoaded() {
  return _state.eventConfig !== null && _state.scheduleCache !== null;
}

// キャッシュ初期化関数
function initializeCache() {
  _state.scheduleCache = new LRUCache({
    max: _state.maxCacheSize,
  });
}

/**
 * スケジュールキャッシュのクリア
 */
function clearScheduleCache() {
  if (!getState("scheduleCache")) {
    initializeCache();
  } else {
    getState("scheduleCache").clear();
  }
}

/**
 * スケジュールデータの設定
 * @param {Object} data - スケジュールデータオブジェクト
 */
function setScheduleData(data) {
  setState("scheduleData", data);
  clearScheduleCache();
}

export {
  getState,
  setState,
  updateCurrentBaseDate,
  isConfigLoaded,
  initializeCache,
  clearScheduleCache,
  setScheduleData,
  _state, // モジュール間で状態を共有するために内部的にエクスポート
};
