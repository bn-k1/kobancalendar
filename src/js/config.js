// config.js - 設定関連の機能を提供するモジュール

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// Day.jsプラグインの設定
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// 定数定義
const CONFIG_PATH = "./config/config.json";
const EVENT_CONFIG_PATH = "./config/event.json";

// 設定情報を保持する変数
let baseDates = [];
let currentBaseDate;
let lastBaseDate;
let holidayYearsRange;
let userDefinedHolidays = [];
let eventSettings;

// 設定ファイルの読み込み
async function loadConfig() {
  try {
    const response = await fetch(CONFIG_PATH);
    if (!response.ok) throw new Error("設定ファイルの取得に失敗しました");
    const config = await response.json();

    if (config.base_dates) {
      baseDates = config.base_dates
        .map((dateStr) => dayjs(dateStr))
        .sort((a, b) => a.unix() - b.unix());
    } else if (config.base_date) {
      baseDates = [dayjs(config.base_date)];
    } else {
      throw new Error("基準日が設定されていません");
    }

    const urlParameters = new URLSearchParams(window.location.search);
    if (urlParameters.has("baseDate")) {
      currentBaseDate = dayjs(urlParameters.get("baseDate"));
      if (!currentBaseDate.isValid()) {
        currentBaseDate = baseDates[0];
      }
    } else {
      currentBaseDate = baseDates[0];
    }

    lastBaseDate = baseDates[baseDates.length - 1];

    holidayYearsRange = config.holiday_years_range;
    userDefinedHolidays = config.custom_holidays || [];

    return {
      baseDates,
      currentBaseDate,
      lastBaseDate,
      holidayYearsRange,
      userDefinedHolidays,
    };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// イベント設定ファイルの読み込み
async function loadEventConfig() {
  try {
    const response = await fetch(EVENT_CONFIG_PATH);
    if (!response.ok)
      throw new Error("イベント設定ファイルの取得に失敗しました");
    eventSettings = await response.json();
    return eventSettings;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// イベントの種類を判定
function getEventType(subject) {
  for (const [type, config] of Object.entries(eventSettings.specialEvents)) {
    if (config.keywords.some((keyword) => subject.includes(keyword))) {
      return { type, config };
    }
  }
  return { type: "default", config: eventSettings.defaultEvent };
}

// 基準日を更新する
function updateCurrentBaseDate(newBaseDate) {
  currentBaseDate = newBaseDate;
  return currentBaseDate;
}

// URLのクエリパラメータを更新
function updateURLParams(baseDate, startNumber) {
  const baseDateStr = baseDate.format("YYYY-MM-DD");
  window.history.pushState(
    {},
    "",
    `?baseDate=${baseDateStr}&startNumber=${startNumber}`,
  );
}

// エクスポート
export {
  loadConfig,
  loadEventConfig,
  getEventType,
  updateCurrentBaseDate,
  updateURLParams,
  baseDates,
  currentBaseDate,
  lastBaseDate,
  userDefinedHolidays,
};
