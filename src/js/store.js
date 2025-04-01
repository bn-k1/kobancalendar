// store.js - アプリケーションの状態管理を一元化するモジュール

import dayjs from "dayjs";
import { memoize } from "lodash";
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
  holidayYearsRange: 5,
  userDefinedHolidays: [],
  icsExportConfig: {
    calendar_name: "KobanCalendar",
    timezone: "Asia/Tokyo",
    company: "bn-k1",
    product: "kobancalendar",
    language: "JP",
    uid_domain: "kobancalendar.jp",
  },

  // イベント設定
  eventConfig: null,

  // 祝日
  allHolidays: {},

  // キャッシュ
  scheduleCache: new LRUCache({
    max: 1000,
  }),
};

// アクセサ関数 - 全ての状態プロパティへの統一的なアクセス方法

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
    // 変更通知は必要に応じて実装可能
    return true;
  }
  console.warn(`存在しない状態キー '${key}' への更新をスキップしました`);
  return false;
}

/**
 * スケジュールデータの設定
 * @param {Object} data - スケジュールデータオブジェクト
 */
function setScheduleData(data) {
  _state.scheduleData = data;
  clearScheduleCache();
}

/**
 * スケジュールキャッシュのクリア
 */
function clearScheduleCache() {
  _state.scheduleCache.clear();
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
 * 祝日データの追加
 * @param {Object} holidays - 祝日データオブジェクト
 */
function setHolidays(holidays) {
  _state.allHolidays = holidays;
}

/**
 * 特定の日が祝日かどうか判定
 * @param {dayjs} date - 判定する日付
 * @returns {boolean} 祝日かどうか
 */
function _isHoliday(date) {
  const dateStr = date.format("YYYY-MM-DD");
  return _state.allHolidays[dateStr] !== undefined || date.day() === 0; // day()は0が日曜
}

// memoizeを使用してパフォーマンスを向上
// dayjs オブジェクトをキーとして扱えるよう、日付文字列に変換してからmemoize
const isHoliday = memoize(
  (date) => _isHoliday(date),
  (date) => date.format("YYYY-MM-DD"),
);

/**
 * イベントの種類を判定
 * @param {string} subject - イベント名/件名
 * @returns {Object} イベントタイプと設定
 */
function _getEventType(subject) {
  const eventConfig = _state.eventConfig;

  if (!eventConfig || !eventConfig.events) {
    console.error("イベント設定が読み込まれていないか無効です");
    return { type: "default", config: { color: "#42a5f5", showTime: true } };
  }

  // events オブジェクト内のすべてのイベントタイプを確認
  for (const [type, config] of Object.entries(eventConfig.events)) {
    // default 以外のイベントタイプの場合、キーワードをチェック
    if (
      type !== "default" &&
      config.keywords &&
      config.keywords.some((keyword) => subject.includes(keyword))
    ) {
      return { type, config };
    }
  }

  // どのイベントタイプにも該当しなかった場合、default設定を返す
  return {
    type: "default",
    config: eventConfig.events.default || { color: "#42a5f5", showTime: true },
  };
}

// memoizeを使用してパフォーマンスを向上
const getEventType = memoize(_getEventType);

/**
 * 設定が完全に読み込まれたかチェックする
 * @returns {boolean} 設定が読み込まれているかどうか
 */
function isConfigLoaded() {
  return _state.eventConfig !== null;
}

/**
 * 任意の日付とコマ位置から勤務内容を返す
 * @param {dayjs} targetDate - 対象日付
 * @param {number} startPosition - 開始位置
 * @param {dayjs} currentBaseDate - 現在の基準日
 * @param {dayjs} lastBaseDate - 最終基準日
 * @returns {Object|null} スケジュール情報
 */
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
  const adjustedStartPosition = startPosition - 1;
  const scheduleData = _state.scheduleData;
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

/**
 * スケジュール情報を取得（キャッシュ対応）
 * @param {dayjs} targetDate - 対象日付
 * @param {number} startPosition - 開始位置
 * @param {dayjs} currentBaseDate - 現在の基準日
 * @param {dayjs} lastBaseDate - 最終基準日
 * @returns {Object|null} スケジュール情報
 */
function getScheduleForDate(
  targetDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  const key = `${targetDate.format("YYYY-MM-DD")}_${startPosition}_${currentBaseDate.format(
    "YYYY-MM-DD",
  )}_${lastBaseDate.format("YYYY-MM-DD")}`;

  if (!_state.scheduleCache.has(key)) {
    const result = _getScheduleForDate(
      targetDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    );
    _state.scheduleCache.set(key, result);
  }

  return _state.scheduleCache.get(key);
}

/**
 * 日付範囲のスケジュールデータを計算して返す
 * @param {string|dayjs} startDate - 開始日
 * @param {string|dayjs} endDate - 終了日
 * @param {number} startPosition - 開始位置
 * @param {dayjs} currentBaseDate - 現在の基準日
 * @param {dayjs} lastBaseDate - 最終基準日
 * @returns {Array} スケジュール情報の配列
 */
function calculateScheduleRange(
  startDate,
  endDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  const scheduleRange = [];

  let currentDate = dayjs(startDate);
  const finalEndDate = dayjs(endDate);

  while (currentDate.isBefore(finalEndDate)) {
    const scheduleInfo = getScheduleForDate(
      currentDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    );

    if (scheduleInfo) {
      scheduleRange.push({
        date: currentDate,
        ...scheduleInfo,
      });
    }

    currentDate = currentDate.add(1, "day");
  }

  return scheduleRange;
}

export {
  getState,
  setState,
  setScheduleData,
  clearScheduleCache,
  updateCurrentBaseDate,
  setHolidays,
  isHoliday,
  getEventType,
  isConfigLoaded,
  getScheduleForDate,
  calculateScheduleRange,
};
