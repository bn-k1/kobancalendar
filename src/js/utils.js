// utils.js - ユーティリティ関数を提供するモジュール
import dayjs from "dayjs";

/**
 * URLクエリパラメータを更新する関数
 * @param {Object} params - 更新するクエリパラメータオブジェクト
 */
export function updateURLParams(params) {
  const url = new URL(window.location);

  // 現在のパラメータをすべて保持しながら新しいパラメータを追加/更新
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });

  // 履歴に追加（現在のページを置き換え）
  window.history.pushState({}, "", url);
}

/**
 * URLから指定したクエリパラメータを取得する関数
 * @param {string} paramName - パラメータ名
 * @param {any} defaultValue - デフォルト値
 * @returns {string|null} パラメータの値
 */
export function getURLParam(paramName, defaultValue = null) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(paramName) ? urlParams.get(paramName) : defaultValue;
}

/**
 * 日付の曜日に応じたクラス名を返す関数
 * @param {dayjs} date - 日付オブジェクト
 * @returns {string} クラス名
 */
export function getDayClass(date) {
  const day = date.day();
  if (day === 0) return "sunday";
  if (day === 6) return "saturday";
  return "";
}

/**
 * 曜日名を返す関数
 * @param {dayjs} date - 日付オブジェクト
 * @returns {string} 曜日名
 */
export function getWeekdayName(date) {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return weekdays[date.day()];
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
 * オブジェクトの深いクローンを作成する関数
 * @param {Object} obj - クローン対象のオブジェクト
 * @returns {Object} クローンされたオブジェクト
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 文字列から簡易的なハッシュ値を生成する関数
 * @param {string} str - ハッシュ化する文字列
 * @returns {string} ハッシュ文字列
 */
export function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16);
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
