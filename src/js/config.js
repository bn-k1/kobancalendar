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
let loadedEventConfig = null;
let icsExportConfig = null;

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
      const requestedBaseDateStr = urlParameters.get("baseDate");
      currentBaseDate = dayjs(requestedBaseDateStr);

      if (!currentBaseDate.isValid()) {
        currentBaseDate = baseDates[0];
      } else {
        const dateExists = baseDates.some(
          (date) =>
            date.format("YYYY-MM-DD") === currentBaseDate.format("YYYY-MM-DD"),
        );

        if (!dateExists) {
          alert("無効な基準日です");
          currentBaseDate = baseDates[0];
        }
      }
    } else {
      currentBaseDate = baseDates[0];
    }

    lastBaseDate = baseDates[baseDates.length - 1];

    holidayYearsRange = config.holiday_years_range;
    userDefinedHolidays = config.custom_holidays || [];

    // ICSエクスポート設定を読み込む
    icsExportConfig = config.info || {
      calendar_name: "KobanCalendar",
      timezone: "Asia/Tokyo",
      company: "bn-k1",
      product: "kobancalendar",
      language: "JP",
      uid_domain: "kobancalendar.jp",
    };

    return {
      baseDates,
      currentBaseDate,
      lastBaseDate,
      holidayYearsRange,
      userDefinedHolidays,
      icsExportConfig,
    };
  } catch (error) {
    console.error("設定ファイルの読み込みに失敗しました:", error.message);
    throw error;
  }
}

// イベント設定ファイルの読み込み
async function loadEventConfig() {
  try {
    if (!eventConfig) {
      throw new Error("イベント設定ファイルの取得に失敗しました");
    }
    loadedEventConfig = eventConfig;
    return loadedEventConfig;
  } catch (error) {
    console.error(
      "イベント設定ファイルの読み込みに失敗しました:",
      error.message,
    );
    throw error;
  }
}

// イベントの種類を判定 - getEventType は必ずイベント設定が読み込まれた後に使用する
function _getEventType(subject) {
  if (!loadedEventConfig) {
    console.error("イベント設定が読み込まれていません");
    return { type: "default", config: { color: "#42a5f5", showTime: true } };
  }

  for (const [type, config] of Object.entries(
    loadedEventConfig.specialEvents,
  )) {
    if (config.keywords.some((keyword) => subject.includes(keyword))) {
      return { type, config };
    }
  }
  return { type: "default", config: loadedEventConfig.defaultEvent };
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

// 設定が完全に読み込まれたかチェックする
function isConfigLoaded() {
  return loadedEventConfig !== null;
}

// ICSエクスポート設定を取得
function getICSExportConfig() {
  return icsExportConfig;
}

// エクスポート
export {
  loadConfig,
  loadEventConfig,
  getEventType,
  updateCurrentBaseDate,
  updateURLParams,
  isConfigLoaded,
  getICSExportConfig,
  baseDates,
  currentBaseDate,
  lastBaseDate,
  userDefinedHolidays,
};
