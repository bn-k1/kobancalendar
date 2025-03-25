// ui.js - ユーザーインターフェース関連の機能を提供

import dayjs from "dayjs";

// 基準日選択セクションを更新
function updateBaseDateSection(baseDates, currentBaseDate) {
  const baseDateSelect = document.getElementById("baseDate");

  baseDateSelect.innerHTML = "";

  baseDates.forEach((date) => {
    const option = document.createElement("option");
    const dateStr = date.format("YYYY-MM-DD");
    option.value = dateStr;
    option.text = dateStr;
    baseDateSelect.appendChild(option);
  });

  const currentBaseDateStr = currentBaseDate.format("YYYY-MM-DD");
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
function initializeStartNumberSelection(rotationCycleLength) {
  let startPositionSelect = document.getElementById("startNumber");
  startPositionSelect.innerHTML = ""; // 選択肢をクリア

  for (let i = 1; i <= rotationCycleLength; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.text = i;
    startPositionSelect.appendChild(option);
  }

  let urlParameters = new URLSearchParams(window.location.search);
  if (urlParameters.has("startNumber")) {
    const startNumber = urlParameters.get("startNumber");
    const startNumberInt = parseInt(startNumber);

    if (
      isNaN(startNumberInt) ||
      startNumberInt < 1 ||
      startNumberInt > rotationCycleLength
    ) {
      alert("無効なコマ位置です");
      startPositionSelect.value = "1";
    } else {
      startPositionSelect.value = startNumberInt;
    }
  } else {
    startPositionSelect.value = "1";
  }
}

// エクスポート
export {
  updateBaseDateSection,
  updateExportSectionLabel,
  showControlSections,
  initializeStartNumberSelection,
};
