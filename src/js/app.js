// app.js - メインアプリケーションの初期化スクリプト
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
import { initializeCalendar, updateCalendar } from "./calendar.js";
import { exportICS } from "./export.js";
import { updateURLParams } from "./ui-utils.js";
import { isBaseDateInPast } from "./date-utils.js";
import { handleError } from "./error-handler.js";
import { APP_CONFIG, DATE_FORMATS, ERROR_MESSAGES } from "./constants.js";

// CSVデータのインポート
import holidayData from "@data/holiday.csv";
import saturdayData from "@data/saturday.csv";
import weekdayData from "@data/weekday.csv";

// Day.jsプラグインの設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.tz.setDefault("Asia/Tokyo");

// Alpineストアの初期化
document.addEventListener("alpine:init", () => {
  initializeStore();
});

// スケジュール管理コンポーネント
Alpine.data("scheduleManager", () => ({
  isLoaded: false,
  baseDates: [],
  selectedBaseDate: "",
  startPosition: APP_CONFIG.DEFAULT_START_POSITION,
  rotationCycleLength: 0,
  calendar: null,
  exportMonths: APP_CONFIG.DEFAULT_EXPORT_MONTHS,
  isBaseDateInPast: false,

  // 初期化処理
  async init() {
    try {
      loadConfig();
      loadEventConfig();

      // ストアから値を取得
      this.baseDates = Alpine.store("state").baseDates;
      this.selectedBaseDate = Alpine.store("state").currentBaseDate.format(
        DATE_FORMATS.ISO_DATE,
      );
      this.rotationCycleLength = 0;

      // データの読み込み
      const scheduleData = loadScheduleData(
        holidayData,
        saturdayData,
        weekdayData,
      );
      Alpine.store("state").setScheduleData(scheduleData);
      this.rotationCycleLength = scheduleData.rotationCycleLength;

      // 祝日データの読み込み
      loadHolidays();

      // URLクエリパラメータから開始位置を取得
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("startNumber")) {
        const startNum = parseInt(urlParams.get("startNumber"));
        if (
          !isNaN(startNum) &&
          startNum >= 1 &&
          startNum <= this.rotationCycleLength
        ) {
          this.startPosition = startNum;
        }
      }

      // 基準日が過去か確認
      this.updateBaseDateStatus();

      // カレンダーの初期化
      this.calendar = initializeCalendar();

      // datesSetイベントハンドラを追加
      if (this.calendar) {
        this.calendar.on("datesSet", () => {
          this.updateCalendar();
        });
      }

      this.isLoaded = true;

      // データロード完了後に明示的にカレンダーを更新
      this.updateCalendar();
    } catch (error) {
      handleError(error, ERROR_MESSAGES.INIT_FAILED);
    }
  },

  // 基準日が過去かどうかの状態を更新
  updateBaseDateStatus() {
    this.isBaseDateInPast = isBaseDateInPast(this.selectedBaseDate);
  },

  // カレンダーの更新
  updateCalendar() {
    if (!this.calendar) return;
    updateCalendar(
      this.calendar,
      parseInt(this.startPosition),
      dayjs(this.selectedBaseDate),
      Alpine.store("state").lastBaseDate,
    );
  },

  // 基準日変更処理
  handleBaseDateChange() {
    const newBaseDate = dayjs(this.selectedBaseDate);
    Alpine.store("state").updateCurrentBaseDate(newBaseDate);
    this.updateBaseDateStatus();
    this.updateURLParams();
    this.updateCalendar();
  },

  // コマ位置変更処理
  handlePositionChange() {
    this.updateURLParams();
    this.updateCalendar();
  },

  // URLパラメータの更新
  updateURLParams() {
    updateURLParams({
      baseDate: this.selectedBaseDate,
      startNumber: this.startPosition,
    });
  },

  // ICSエクスポート処理
  handleExportICS() {
    const months = parseInt(this.exportMonths);
    const startNumber = parseInt(this.startPosition);
    exportICS(
      months,
      startNumber,
      dayjs(this.selectedBaseDate),
      Alpine.store("state").lastBaseDate,
    );
  },
}));

// Alpine.jsを起動
window.Alpine = Alpine;
Alpine.start();
