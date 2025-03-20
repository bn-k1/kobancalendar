// main.js - アプリケーションのエントリーポイント

import "../css/style.css";
import dayjs from "dayjs";

import {
  loadConfig,
  loadEventConfig,
  updateCurrentBaseDate,
  updateURLParams,
  baseDates,
  currentBaseDate,
  lastBaseDate,
} from "./config.js";

import { loadScheduleData, loadHolidays } from "./data-loader.js";

import {
  setScheduleData,
  initializeCalendar,
  updateCalendar,
  exportCSV,
} from "./schedule.js";

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
  updateCalendar(currentBaseDate, lastBaseDate);
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
  updateURLParams(currentBaseDate, startNumber);
  handleCalendarUpdate();
}

// CSVエクスポート処理のハンドラー
function handleExportCSV() {
  const months = parseInt(document.getElementById("exportMonths").value);
  const startNumber = parseInt(document.getElementById("startNumber").value);
  exportCSV(months, startNumber, currentBaseDate, lastBaseDate);
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
    .addEventListener("click", handleExportCSV);
}

async function initializeApp() {
  try {
    // 設定とイベントのロード（まとめて処理）
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
    updateBaseDateSection(baseDates, currentBaseDate);
    showControlSections(currentBaseDate);
    initializeStartNumberSelection(shiftData.rotationCycleLength);
    initializeCalendar(handleCalendarUpdate);

    // イベントリスナーの設定
    setupEventListeners();
  } catch (error) {
    console.error("アプリケーションの初期化に失敗しました:", error);
  }
}

// ページ読み込み時の処理
window.onload = initializeApp;
