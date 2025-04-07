// config.js - 設定関連の機能を提供するモジュール
import Alpine from "alpinejs";
import dayjs from "dayjs";

// 設定ファイルのインポート（パスは適宜調整）
import config from "@config/config.json";
import eventConfig from "@config/event.json";

// 設定ファイルの読み込み
export async function loadConfig() {
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
      throw new Error("基準日が設定されていません");
    }

    // ストアに基準日一覧を設定
    store.baseDates = baseDates;

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
    store.currentBaseDate = currentBaseDate;
    store.lastBaseDate = baseDates[baseDates.length - 1];

    // 祝日年範囲の設定
    if (config.holiday_years_range !== undefined) {
      store.holidayYearsRange = config.holiday_years_range;
    }

    // キャッシュサイズの設定
    if (config.max_cache_size !== undefined) {
      store.maxCacheSize = config.max_cache_size;
      // キャッシュの初期化
      store.initializeCache();
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
      maxCacheSize: store.maxCacheSize,
    };
  } catch (error) {
    console.error("設定ファイルの読み込みに失敗しました:", error.message);
    throw error;
  }
}

// イベント設定ファイルの読み込み
export async function loadEventConfig() {
  try {
    Alpine.store("state").eventConfig = eventConfig;
    return eventConfig;
  } catch (error) {
    console.error(
      "イベント設定ファイルの読み込みに失敗しました:",
      error.message,
    );
    throw error;
  }
}
