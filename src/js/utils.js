import dayjs from "dayjs";
import Alpine from "alpinejs";
import { WEEKDAYS, ERROR_MESSAGES } from "./constants.js";

const shownErrors = new Map();

export function handleError(error, context, showAlert = true) {
  // エラーをコンソールに記録
  console.error(`${context}:`, error);

  // 重複アラートを防止
  const errorKey = `${context}_${error.message}`;

  // ユーザーにエラーを通知（一度だけ）
  if (showAlert && !shownErrors.has(errorKey)) {
    shownErrors.set(errorKey, true);
    alert(`${error.message}`);
  }

  return { success: false, error: error.message };
}

// 曜日名を返す関数
export function getWeekdayName(date) {
  return WEEKDAYS[date.day()];
}

// 日付の曜日や祝日に応じたクラス名を返す関数
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

// 基準日が過去かどうかを確認する関数
export function isBaseDateInPast(selectedBaseDate) {
  const today = dayjs().startOf("day");
  const currentBaseDate = dayjs(selectedBaseDate);
  return currentBaseDate.isBefore(today);
}

// URLクエリパラメータを更新する関数
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

// URLから指定したクエリパラメータを取得する関数
export function getURLParam(paramName, defaultValue = null) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(paramName) ? urlParams.get(paramName) : defaultValue;
}

// URLから日付パラメータを取得し、検証する関数
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

// URLから数値パラメータを取得し、検証する関数
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
