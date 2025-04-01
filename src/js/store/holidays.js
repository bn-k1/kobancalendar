// store/holidays.js - 祝日関連の機能
import dayjs from "dayjs";
import { memoize } from "lodash";
import { getState, setState } from "./state.js";

/**
 * 祝日データの追加
 * @param {Object} holidays - 祝日データオブジェクト
 */
function setHolidays(holidays) {
  // state.jsから直接importした関数を使用
  setState("allHolidays", holidays);
}

/**
 * 特定の日が祝日かどうか判定
 * @param {dayjs} date - 判定する日付
 * @returns {boolean} 祝日かどうか
 */
function _isHoliday(date) {
  // 引数が dayjs オブジェクトではない場合、変換する
  const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
  const dateStr = dateObj.format("YYYY-MM-DD");
  const allHolidays = getState("allHolidays");
  return allHolidays[dateStr] !== undefined || dateObj.day() === 0; // day()は0が日曜
}

// memoizeを使用してパフォーマンスを向上
// dayjs オブジェクトをキーとして扱えるよう、日付文字列に変換してからmemoize
const isHoliday = memoize(
  (date) => _isHoliday(date),
  (date) => {
    // 引数が dayjs オブジェクトではない場合、変換する
    const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
    return dateObj.format("YYYY-MM-DD");
  },
);

/**
 * 祝日の名前を取得する関数
 * @param {dayjs} date - 日付
 * @returns {string|undefined} 祝日名または undefined
 */
function getHolidayName(date) {
  // 引数が dayjs オブジェクトではない場合、変換する
  const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
  const dateStr = dateObj.format("YYYY-MM-DD");
  const allHolidays = getState("allHolidays");
  return allHolidays[dateStr];
}

export { setHolidays, isHoliday, getHolidayName };
