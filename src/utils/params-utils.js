import dayjs from "dayjs";
import { ERROR_MESSAGES , DATE_FORMATS } from "@/config/constants";

/**
 * URLクエリパラメータを更新する関数
 * @param {Object} params 更新するパラメータと値のオブジェクト
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
 * @param {string} paramName パラメータ名
 * @param {*} defaultValue デフォルト値
 * @returns {string} パラメータ値
 */
export function getURLParam(paramName, defaultValue = null) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(paramName) ? urlParams.get(paramName) : defaultValue;
}

/**
 * URLから日付パラメータを取得し、検証する関数
 * @param {string} paramName パラメータ名
 * @param {dayjs} defaultValue デフォルト値
 * @param {Array} validDates 有効な日付リスト
 * @returns {dayjs} 取得した日付オブジェクト
 */
export function getDateParam(paramName, defaultValue, validDates = []) {
  const dateStr = getURLParam(paramName);

  if (!dateStr) {
    return defaultValue;
  }

  const dateObj = dayjs(dateStr);

  // 日付形式が無効な場合
  if (!dateObj.isValid()) {
    console.error(`${ERROR_MESSAGES.INVALID_URL_PARAM}: ${paramName}`);
    return defaultValue;
  }

  // 有効な日付リストが指定されている場合、チェックする
  if (validDates.length > 0) {
    const dateExists = validDates.some(
      (date) => date.format(DATE_FORMATS.ISO_DATE) === dateObj.format(DATE_FORMATS.ISO_DATE),
    );

    if (!dateExists) {
      console.error(ERROR_MESSAGES.INVALID_BASE_DATE);
      return defaultValue;
    }
  }

  return dateObj;
}

/**
 * URLから数値パラメータを取得し、検証する関数
 * @param {string} paramName パラメータ名
 * @param {number} defaultValue デフォルト値
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @returns {number} 取得した数値
 */
export function getNumberParam(
  paramName,
  defaultValue,
  min = null,
  max = null,
) {
  const valueStr = getURLParam(paramName);

  if (!valueStr) {
    return defaultValue;
  }

  const value = parseInt(valueStr, 10);

  // 数値でない場合
  if (isNaN(value)) {
    console.error(`${ERROR_MESSAGES.INVALID_URL_PARAM}: ${paramName}`);
    return defaultValue;
  }

  // 範囲チェック
  if (min !== null && value < min) {
    console.error(ERROR_MESSAGES.INVALID_STARTNUMBER);
    return defaultValue;
  }

  if (max !== null && value > max) {
    console.error(ERROR_MESSAGES.INVALID_STARTNUMBER);
    return defaultValue;
  }

  return value;
}
