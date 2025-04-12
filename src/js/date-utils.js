// date-utils.js - 日付操作関連のユーティリティ関数
import dayjs from "dayjs";
import { WEEKDAYS } from "./constants.js";
import Alpine from "alpinejs";

/**
 * 曜日名を返す関数
 * @param {dayjs} date - 日付オブジェクト
 * @returns {string} 曜日名
 */
export function getWeekdayName(date) {
  return WEEKDAYS[date.day()];
}

/**
 * 日付の曜日や祝日に応じたクラス名を返す関数
 * @param {dayjs} date - 日付オブジェクト
 * @returns {string} クラス名
 */
export function getDayClass(date) {
  const day = date.day();

  if (Alpine.store("state") && Alpine.store("state").isHoliday(date)) {
    return "holiday";
  }

  // 曜日による判定
  if (day === 0) return "fc-day-sun";
  if (day === 6) return "fc-day-sat";

  return "";
}

/**
 * 時間文字列を解析してdayjsオブジェクトを返す関数
 * @param {string} timeStr - 時間文字列 (例: "09:30")
 * @param {dayjs} baseDate - 基準となる日付オブジェクト
 * @returns {dayjs} 時間を設定したdayjsオブジェクト
 */
export function parseTimeToDate(timeStr, baseDate = dayjs()) {
  if (!timeStr) return null;

  const [hours, minutes = "00"] = timeStr.split(":");
  return baseDate
    .hour(parseInt(hours, 10))
    .minute(parseInt(minutes, 10))
    .second(0);
}

/**
 * フォーマットされた時間表示を生成する関数
 * @param {string} startTime - 開始時間
 * @param {string} endTime - 終了時間
 * @returns {string} フォーマットされた時間表示
 */
export function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return "-";
  return `${startTime} - ${endTime}`;
}

/**
 * 日付が範囲内かどうかを確認する関数
 * @param {dayjs} date - 確認する日付
 * @param {dayjs} startDate - 範囲の開始日
 * @param {dayjs} endDate - 範囲の終了日
 * @returns {boolean} 範囲内であればtrue
 */
export function isDateInRange(date, startDate, endDate) {
  return (
    (date.isAfter(startDate) || date.isSame(startDate, "day")) &&
    (date.isBefore(endDate) || date.isSame(endDate, "day"))
  );
}

/**
 * 基準日が過去かどうかを確認する関数
 * @param {string} selectedBaseDate - 選択された基準日
 * @returns {boolean} 過去の日付であればtrue
 */
export function isBaseDateInPast(selectedBaseDate) {
  const today = dayjs().startOf("day");
  const currentBaseDate = dayjs(selectedBaseDate);
  return currentBaseDate.isBefore(today);
}
