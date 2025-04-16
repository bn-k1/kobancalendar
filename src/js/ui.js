// ui.js - ユーザーインターフェース関連の機能を提供

import dayjs from "dayjs";
import { getState } from "./store/index.js";
import { clearElement, createOption } from "./dom-util.js";

// 基準日選択セクションを更新
function updateBaseDateSection(baseDates, currentBaseDate) {
  const baseDateSelect = document.getElementById("baseDate");
  const currentBaseDateStr = currentBaseDate.format("YYYY-MM-DD");

  // 既存のオプション数を取得
  const existingOptions = baseDateSelect.options.length;

  // 既存のオプションと新しいオプションの数が一致し、
  // かつ現在の値が正しければ、更新をスキップ
  if (
    existingOptions === baseDates.length &&
    baseDateSelect.value === currentBaseDateStr
  ) {
    // すでに正しく設定されている場合は更新しない
    return;
  }

  // 要素をクリアして新しいオプションを追加
  clearElement(baseDateSelect);

  // オプションを追加
  baseDates.forEach((date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const option = createOption(dateStr, dateStr);
    baseDateSelect.appendChild(option);
  });

  // 値を設定
  baseDateSelect.value = currentBaseDateStr;
}

function updateExportSectionLabel(currentBaseDate) {
  const today = dayjs().startOf("day");
  const exportLabelPostBaseDate = document.getElementById(
    "exportLabelPostBaseDate",
  );
  const exportLabelPreBaseDate = document.getElementById(
    "exportLabelPreBaseDate",
  );

  if (exportLabelPostBaseDate && exportLabelPreBaseDate) {
    if (currentBaseDate.isAfter(today) || currentBaseDate.isSame(today)) {
      // 基準日が今日以降の場合
      exportLabelPostBaseDate.classList.add("hidden");
      exportLabelPreBaseDate.classList.remove("hidden");
    } else {
      // 基準日が今日より前の場合
      exportLabelPostBaseDate.classList.remove("hidden");
      exportLabelPreBaseDate.classList.add("hidden");
    }
  }
}

// コントロールセクションを表示する
function showControlSections(currentBaseDate) {
  if (currentBaseDate) {
    document.getElementById("baseDateSection").classList.remove("hidden");
    document.getElementById("startNumberSection").classList.remove("hidden");
    document.getElementById("exportSection").classList.remove("hidden");
  }
}

// スタート番号選択の初期化
function initializeStartNumberSelection() {
  const rotationCycleLength = getState("scheduleData").rotationCycleLength;
  let startPositionSelect = document.getElementById("startNumber");

  // URLからstartNumberを取得
  let urlParameters = new URLSearchParams(window.location.search);
  let startNumberFromURL = 1; // デフォルト値

  if (urlParameters.has("startNumber")) {
    const startNumber = urlParameters.get("startNumber");
    const startNumberInt = parseInt(startNumber);

    if (
      !isNaN(startNumberInt) &&
      startNumberInt >= 1 &&
      startNumberInt <= rotationCycleLength
    ) {
      startNumberFromURL = startNumberInt;
    } else {
      alert("無効なコマ位置です");
    }
  }

  // 現在のオプション数とrotationCycleLengthを比較
  if (startPositionSelect.options.length === rotationCycleLength) {
    // オプション数が一致している場合は、値だけを設定
    startPositionSelect.value = startNumberFromURL.toString();
    return;
  }

  // 要素をクリアして新しいオプションを追加
  clearElement(startPositionSelect);

  // オプションを追加
  for (let i = 0; i < rotationCycleLength; i++) {
    const value = i + 1;
    const option = createOption(value.toString(), value.toString());
    startPositionSelect.appendChild(option);
  }

  // 値を設定
  startPositionSelect.value = startNumberFromURL.toString();
}

// エクスポート
export {
  updateBaseDateSection,
  updateExportSectionLabel,
  showControlSections,
  initializeStartNumberSelection,
};
