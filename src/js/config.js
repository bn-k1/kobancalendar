// config.js - 設定関連の機能を提供するモジュール

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { memoize } from "lodash";
import config from "@config/config.json";
import eventConfig from "@config/event.json";

// Day.jsプラグインの設定
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// 設定情報を保持する変数
let baseDates = [];
let currentBaseDate;
let lastBaseDate;
let holidayYearsRange;
let userDefinedHolidays = [];

// 設定ファイルの読み込み
async function loadConfig() {
  try {
    if (!config) {
      throw new Error("設定ファイルの取得に失敗しました");
    }

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
    if (!eventConfig) {
      throw new Error("イベント設定ファイルの取得に失敗しました");
    }
    return eventConfig;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// イベントの種類を判定 - 元の実装
function _getEventType(subject) {
  for (const [type, config] of Object.entries(eventConfig.specialEvents)) {
    if (config.keywords.some((keyword) => subject.includes(keyword))) {
      return { type, config };
    }
  }
  return { type: "default", config: eventConfig.defaultEvent };
}

// memoizeを使用してパフォーマンスを向上
const getEventType = memoize(_getEventType);

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
