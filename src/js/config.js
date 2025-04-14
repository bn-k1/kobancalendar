// config.js - 設定関連の機能を提供するモジュール
import Alpine from "alpinejs";
import dayjs from "dayjs";
import { getDateParam, parseURLParams } from "./url-utils.js";
import { handleError } from "./error-handler.js";
import { ERROR_MESSAGES, DATE_FORMATS } from "./constants.js";

// 設定ファイルのインポート（パスは適宜調整）
import config from "@config/config.json";
import eventConfig from "@config/event.json";

export function loadConfig() {
  try {
    const store = Alpine.store("state");

    let baseDates = [];
    if (config.base_dates) {
      baseDates = config.base_dates
        .map((dateStr) => dayjs(dateStr))
        .sort((a, b) => a.unix() - b.unix());
    } else if (config.base_date) {
      baseDates = [dayjs(config.base_date)];
    } else {
      throw new Error(ERROR_MESSAGES.NO_BASE_DATE);
    }

    // ストアに基準日一覧を設定
    store.baseDates = baseDates;

    // URLからの基準日取得処理

    const params = parseURLParams({
      baseDate: { type: "date", default: baseDates[0], validValues: baseDates },
    });
    const currentBaseDate = params.baseDate;

    // ストアに現在と最終の基準日を設定
    store.currentBaseDate = currentBaseDate;
    store.lastBaseDate = baseDates[baseDates.length - 1];

    // 祝日年範囲の設定
    if (config.holiday_years_range !== undefined) {
      store.holidayYearsRange = config.holiday_years_range;
    }

    // 祝日設定
    store.userDefinedHolidays = config.custom_holidays || [];

    // ICSエクスポート設定を読み込む
    store.icsExportConfig = config.info;

    return {
      baseDates,
      currentBaseDate: store.currentBaseDate,
      lastBaseDate: store.lastBaseDate,
      holidayYearsRange: store.holidayYearsRange,
      userDefinedHolidays: store.userDefinedHolidays,
      icsExportConfig: store.icsExportConfig,
    };
  } catch (error) {
    return handleError(error, ERROR_MESSAGES.CONFIG_LOAD_ERROR);
  }
}

// イベント設定ファイルの読み込み
export function loadEventConfig() {
  try {
    Alpine.store("state").eventConfig = eventConfig;
    return eventConfig;
  } catch (error) {
    return handleError(error, ERROR_MESSAGES.EVENT_CONFIG_LOAD_ERROR);
  }
}
