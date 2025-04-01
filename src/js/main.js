// main.js - カレンダー更新部分の修正

import "../css/style.css";
import dayjs from "dayjs";

import {
  loadConfig,
  loadEventConfig,
  updateCurrentBaseDate,
  updateURLParams,
  isConfigLoaded,
} from "./config.js";

import { loadScheduleData, loadHolidays } from "./data-loader.js";
import { setScheduleData } from "./store.js";
import {
  initializeCalendar,
  updateCalendar,
  refreshCalendarView,
} from "./calendar.js";
import { exportICS } from "./export.js";
import { getState } from "./store.js";

import {
  updateBaseDateSection,
  showControlSections,
  initializeStartNumberSelection,
  updateExportSectionLabel,
} from "./ui.js";

// グローバル設定変数
let appConfig;
let shiftData;

// カレンダー更新用のコールバック関数
function handleCalendarUpdate() {
  if (!isConfigLoaded()) {
    console.warn(
      "設定がまだ完全に読み込まれていません。カレンダー更新をスキップします。",
    );
    return;
  }

  // カレンダー更新時にリフレッシュも実行
  updateCalendar(getState("currentBaseDate"), getState("lastBaseDate"));
  refreshCalendarView();
}

// 基準日の変更時の処理を更新
function handleBaseDateChange() {
  const baseDateSelect = document.getElementById("baseDate");
  const newBaseDate = dayjs(baseDateSelect.value);
  updateCurrentBaseDate(newBaseDate);
  updateExportSectionLabel(newBaseDate);
  updateURLAndGenerateSchedule();
}

// URLの更新とスケジュール生成
function updateURLAndGenerateSchedule() {
  const startNumber = document.getElementById("startNumber").value;
  updateURLParams(getState("currentBaseDate"), startNumber);
  handleCalendarUpdate();
}

// ICSエクスポート処理のハンドラー
function handleExportICS() {
  const months = parseInt(document.getElementById("exportMonths").value);
  const startNumber = parseInt(document.getElementById("startNumber").value);
  exportICS(
    months,
    startNumber,
    getState("currentBaseDate"),
    getState("lastBaseDate"),
  );
}

// イベントリスナーの設定
function setupEventListeners() {
  document
    .getElementById("baseDate")
    .addEventListener("change", handleBaseDateChange);
  document
    .getElementById("startNumber")
    .addEventListener("change", updateURLAndGenerateSchedule);
  document
    .getElementById("exportButton")
    .addEventListener("click", handleExportICS);
}

async function initializeApp() {
  try {
    const [configResult] = await Promise.all([loadConfig(), loadEventConfig()]);

    appConfig = configResult;

    // スケジュールデータの読み込み
    shiftData = await loadScheduleData();
    setScheduleData(shiftData);

    // 祝日データのロード
    await loadHolidays(
      appConfig.holidayYearsRange,
      appConfig.userDefinedHolidays,
    );

    // UIの初期化
    updateBaseDateSection(getState("baseDates"), getState("currentBaseDate"));
    updateExportSectionLabel(getState("currentBaseDate"));
    showControlSections(getState("currentBaseDate"));
    initializeStartNumberSelection(shiftData.rotationCycleLength);

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
