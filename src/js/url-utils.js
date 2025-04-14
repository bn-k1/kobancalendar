// url-utils.js - URL関連のユーティリティ関数
import { handleError } from "./error-handler.js";
import { ERROR_MESSAGES } from "./constants.js";
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
 * URLから日付パラメータを取得し、検証する関数
 * @param {string} paramName - パラメータ名
 * @param {dayjs} defaultValue - デフォルト値
 * @param {Array} validDates - 有効な日付の配列（オプション）
 * @returns {dayjs} 検証済みの日付
 */
export function getDateParam(paramName, defaultValue, validDates = []) {
  const dateStr = getURLParam(paramName);

  if (!dateStr) {
    return defaultValue;
  }

  const dateObj = dayjs(dateStr);

  // 日付形式が無効な場合
  if (!dateObj.isValid()) {
    handleError(
      new Error(ERROR_MESSAGES.INVALID_URL_PARAM),
      `${ERROR_MESSAGES.INVALID_URL_PARAM}: ${paramName}`,
      true,
    );
    return defaultValue;
  }

  // 有効な日付リストが指定されている場合、チェックする
  if (validDates.length > 0) {
    const dateExists = validDates.some(
      (date) => date.format("YYYY-MM-DD") === dateObj.format("YYYY-MM-DD"),
    );

    if (!dateExists) {
      handleError(
        new Error(ERROR_MESSAGES.INVALID_BASE_DATE),
        ERROR_MESSAGES.INVALID_BASE_DATE,
        true,
      );
      return defaultValue;
    }
  }

  return dateObj;
}

/**
 * URLから数値パラメータを取得し、検証する関数
 * @param {string} paramName - パラメータ名
 * @param {number} defaultValue - デフォルト値
 * @param {number} min - 最小値（オプション）
 * @param {number} max - 最大値（オプション）
 * @returns {number} 検証済みの数値
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
    handleError(
      new Error(ERROR_MESSAGES.INVALID_URL_PARAM),
      `${ERROR_MESSAGES.INVALID_URL_PARAM}: ${paramName}`,
      true,
    );
    return defaultValue;
  }

  // 範囲チェック
  if (min !== null && value < min) {
    handleError(
      new Error(ERROR_MESSAGES.INVALID_STARTNUMBER),
      ERROR_MESSAGES.INVALID_STARTNUMBER,
      true,
    );
    return defaultValue;
  }

  if (max !== null && value > max) {
    handleError(
      new Error(ERROR_MESSAGES.INVALID_STARTNUMBER),
      ERROR_MESSAGES.INVALID_STARTNUMBER,
      true,
    );
    return defaultValue;
  }

  return value;
}

/**
 * 現在のURLをパースして複数のパラメータを一度に取得する関数
 * @param {Object} paramConfig - パラメータ設定オブジェクト
 * @returns {Object} 検証済みのパラメータオブジェクト
 *
 * 使用例:
 * const params = parseURLParams({
 *   baseDate: { type: 'date', default: dayjs(), validValues: baseDates },
 *   startNumber: { type: 'number', default: 1, min: 1, max: 5 },
 *   view: { type: 'string', default: 'month' }
 * });
 */
export function parseURLParams(paramConfig) {
  const result = {};

  Object.entries(paramConfig).forEach(([paramName, config]) => {
    switch (config.type) {
      case "date":
        result[paramName] = getDateParam(
          paramName,
          config.default,
          config.validValues,
        );
        break;
      case "number":
        result[paramName] = getNumberParam(
          paramName,
          config.default,
          config.min,
          config.max,
        );
        break;
      case "string":
      default:
        result[paramName] = getURLParam(paramName, config.default);
    }
  });

  return result;
}
