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
import { loadScheduleData, loadHolidays } from "./data-loader.js";
import { loadConfig, loadEventConfig } from "./config.js";
import { initializeCalendar, updateCalendar } from "./calendar.js";
import { exportICS } from "./export.js";
import { updateURLParams } from "./utils.js";

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
  startPosition: 1,
  rotationCycleLength: 0,
  calendar: null,
  exportMonths: 3,
  isBaseDateInPast: false,

  // 初期化処理
  async init() {
    try {
      // 設定の読み込み
      await Promise.all([loadConfig(), loadEventConfig()]);

      // ストアから値を取得
      this.baseDates = Alpine.store("state").baseDates;
      this.selectedBaseDate =
        Alpine.store("state").currentBaseDate.format("YYYY-MM-DD");
      this.rotationCycleLength = 0;

      // データの読み込み
      const scheduleData = await loadScheduleData();
      Alpine.store("state").setScheduleData(scheduleData);
      this.rotationCycleLength = scheduleData.rotationCycleLength;
      await loadHolidays();

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

      this.isLoaded = true;
    } catch (error) {
      console.error("アプリケーションの初期化に失敗しました:", error);
      alert(`アプリケーションの初期化に失敗しました: ${error.message}`);
    }
  },

  // 基準日が過去かどうかの状態を更新
  updateBaseDateStatus() {
    const today = dayjs().startOf("day");
    const currentBaseDate = dayjs(this.selectedBaseDate);
    this.isBaseDateInPast = currentBaseDate.isBefore(today);
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
