// eventListeners.js - イベントリスナーとイベントハンドラーを管理
import dayjs from "dayjs";
import { updateCurrentBaseDate, updateURLParams } from "./config.js";
import { getState } from "./store/index.js";
import { handleCalendarUpdate } from "./calendar/index.js";
import { updateExportSectionLabel } from "./ui.js";
import { exportICS } from "./export.js";

/**
 * 基準日の変更時の処理
 */
function handleBaseDateChange() {
  const baseDateSelect = document.getElementById("baseDate");
  const newBaseDate = dayjs(baseDateSelect.value);
  updateCurrentBaseDate(newBaseDate);
  updateExportSectionLabel(newBaseDate);
  updateURLAndGenerateSchedule();
}

/**
 * URLの更新とスケジュール生成
 */
function updateURLAndGenerateSchedule() {
  const startNumber = document.getElementById("startNumber").value;
  updateURLParams(getState("currentBaseDate"), startNumber);
  handleCalendarUpdate();
}

/**
 * ICSエクスポート処理のハンドラー
 */
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

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
  // イベントリスナー登録を関数で抽象化
  function addListener(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  // 各イベントリスナーを設定
  addListener("baseDate", "change", handleBaseDateChange);
  addListener("startNumber", "change", updateURLAndGenerateSchedule);
  addListener("exportButton", "click", handleExportICS);
}

export {
  setupEventListeners,
  handleBaseDateChange,
  updateURLAndGenerateSchedule,
  handleExportICS,
};
