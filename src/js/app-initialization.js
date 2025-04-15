// app-initialization.js - アプリケーションの初期化と設定を管理
import Alpine from "alpinejs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// CSSのインポート
import "../css/style.css";

// プロジェクト固有のモジュール
import { initializeStore } from "./store.js";
import { loadScheduleData } from "./schedule-service.js";
import { loadHolidays } from "./holiday-service.js";
import { loadConfig, loadEventConfig } from "./config.js";
import { handleError } from "./utils.js";
import { ERROR_MESSAGES } from "./constants.js";

// CSVデータのインポート
import holidayData from "@data/holiday.csv";
import saturdayData from "@data/saturday.csv";
import weekdayData from "@data/weekday.csv";

// Day.jsプラグインの設定
export function configureDayjs() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(customParseFormat);
  dayjs.extend(isSameOrBefore);
  dayjs.extend(isSameOrAfter);
  dayjs.tz.setDefault("Asia/Tokyo");
}

// アプリケーション初期化関数
export async function initializeApplication() {
  try {
    // 設定の読み込み
    const config = loadConfig();
    loadEventConfig();

    // スケジュールデータの読み込み
    const scheduleData = loadScheduleData(
      holidayData,
      saturdayData,
      weekdayData,
    );
    Alpine.store("state").setScheduleData(scheduleData);

    // 祝日データの読み込み
    loadHolidays();

    return {
      success: true,
      config,
      scheduleData,
    };
  } catch (error) {
    handleError(error, ERROR_MESSAGES.INIT_FAILED);
    return { success: false, error };
  }
}

// Alpineの初期設定
export function setupAlpine() {
  // Alpineストアの初期化
  document.addEventListener("alpine:init", () => {
    initializeStore();
  });

  // Alpine.jsを起動
  window.Alpine = Alpine;
}
