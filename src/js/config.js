// config.js - 設定関連の機能を提供するモジュール

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import config from "@config/config.json";
import eventConfig from "@config/event.json";
import {
  getState,
  setState,
  updateCurrentBaseDate,
  isConfigLoaded,
  getEventType,
} from "./store.js";

// Day.jsプラグインの設定
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// 設定ファイルの読み込み
async function loadConfig() {
  try {
    if (!config) {
      throw new Error("設定ファイルの取得に失敗しました");
    }

    let baseDates = [];
    if (config.base_dates) {
      baseDates = config.base_dates
        .map((dateStr) => dayjs(dateStr))
        .sort((a, b) => a.unix() - b.unix());
    } else if (config.base_date) {
      baseDates = [dayjs(config.base_date)];
    } else {
      throw new Error("基準日が設定されていません");
    }

    // ストアに基準日一覧を設定
    setState("baseDates", baseDates);

    // URLからの基準日取得処理
    let currentBaseDate;
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

    // ストアに現在と最終の基準日を設定
    setState("currentBaseDate", currentBaseDate);
    setState("lastBaseDate", baseDates[baseDates.length - 1]);

    // 祝日設定
    setState("userDefinedHolidays", config.custom_holidays || []);

    // ICSエクスポート設定を読み込む
    const icsExportConfig = config.info || {
      calendar_name: "KobanCalendar",
      timezone: "Asia/Tokyo",
      company: "bn-k1",
      product: "kobancalendar",
      language: "JP",
      uid_domain: "kobancalendar.jp",
    };
    setState("icsExportConfig", icsExportConfig);

    return {
      baseDates,
      currentBaseDate: getState("currentBaseDate"),
      lastBaseDate: getState("lastBaseDate"),
      holidayYearsRange: getState("holidayYearsRange"),
      userDefinedHolidays: getState("userDefinedHolidays"),
      icsExportConfig: getState("icsExportConfig"),
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
    setState("eventConfig", eventConfig);
    return eventConfig;
  } catch (error) {
    console.error(
      "イベント設定ファイルの読み込みに失敗しました:",
      error.message,
    );
    throw error;
  }
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

// ICSエクスポート設定を取得
function getICSExportConfig() {
  return getState("icsExportConfig");
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
};

// エクスポート（storeから直接取得するためのエイリアス）
export const baseDates = () => getState("baseDates");
export const currentBaseDate = () => getState("currentBaseDate");
export const lastBaseDate = () => getState("lastBaseDate");
export const userDefinedHolidays = () => getState("userDefinedHolidays");
