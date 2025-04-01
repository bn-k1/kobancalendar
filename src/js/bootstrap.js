// bootstrap.js - アプリケーションの初期化を担当
import "../css/style.css";
import { loadConfig, loadEventConfig } from "./config.js";
import { loadScheduleData, loadHolidays } from "./data-loader.js";
import { setScheduleData, getState } from "./store/index.js";
import { initializeCalendar, handleCalendarUpdate } from "./calendar/index.js";
import {
  updateBaseDateSection,
  showControlSections,
  initializeStartNumberSelection,
  updateExportSectionLabel,
} from "./ui.js";
import { setupEventListeners } from "./eventListener.js";

async function initializeApp() {
  try {
    // 設定の読み込み
    await Promise.all([loadConfig(), loadEventConfig()]);

    // データの読み込み
    setScheduleData(await loadScheduleData());
    await loadHolidays();

    // UIの初期化
    updateBaseDateSection(getState("baseDates"), getState("currentBaseDate"));
    updateExportSectionLabel(getState("currentBaseDate"));
    showControlSections(getState("currentBaseDate"));
    initializeStartNumberSelection();

    // カレンダーを初期化
    initializeCalendar(handleCalendarUpdate);

    // イベントリスナーの設定
    setupEventListeners();

    // 初期表示のためにカレンダーを更新
    handleCalendarUpdate();
  } catch (error) {
    console.error("アプリケーションの初期化に失敗しました:", error);
    alert(`アプリケーションの初期化に失敗しました: ${error.message}`);
  }
}

// ページ読み込み時の処理
window.onload = initializeApp;

export { handleCalendarUpdate };
