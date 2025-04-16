// meetup/participants.js - 参加者管理のモジュール
import { getState } from "../store/index.js";
import { clearElement, createOption, createElement } from "../dom-util.js";

/**
 * 参加者セクションの初期化
 */
function initializeParticipants() {
  const rotationCycleLength = getState("scheduleData").rotationCycleLength;
  populatePositionSelects(rotationCycleLength);
}

/**
 * すべての参加者位置選択肢を更新
 * @param {number} rotationCycleLength - ローテーションの長さ
 */
function populatePositionSelects(rotationCycleLength) {
  const positionSelects = document.querySelectorAll(".participant-position");

  positionSelects.forEach((select) => {
    // 選択されていた値を保持
    const selectedValue = select.value;

    // 最初のオプション（プレースホルダ）
    const firstOption = select.querySelector("option[disabled]");
    const placeholderText = firstOption
      ? firstOption.textContent
      : "コマ位置を選択";

    // 要素をクリアして新しいオプションを追加
    clearElement(select);

    // プレースホルダオプションを追加
    const placeholder = createOption("", placeholderText, false, true);
    select.appendChild(placeholder);

    // 位置オプションを追加
    for (let i = 0; i < rotationCycleLength; i++) {
      const value = (i + 1).toString();
      const option = createOption(value, value);
      select.appendChild(option);
    }

    // 以前選択されていた値があれば復元
    if (selectedValue) {
      select.value = selectedValue;
    }
  });
}

/**
 * 新しい参加者行を追加
 */
function addParticipant() {
  const participantsList = document.getElementById("participantsList");

  // 新しい参加者行を作成
  const participantEntry = createElement("div", {
    className: "participant-entry",
  });

  // 位置選択セレクトボックスを作成
  const positionSelect = createElement("select", {
    className: "participant-position",
    "aria-label": "参加者のコマ位置",
  });

  // プレースホルダオプションを追加
  const placeholder = createOption("", "コマ位置を選択", true, true);
  positionSelect.appendChild(placeholder);

  // 削除ボタンを作成
  const removeButton = createElement(
    "button",
    {
      className: "remove-participant",
      "aria-label": "この参加者を削除",
      onclick: function () {
        participantsList.removeChild(participantEntry);
      },
    },
    "✕",
  );

  // 要素を組み立て
  participantEntry.appendChild(positionSelect);
  participantEntry.appendChild(removeButton);

  // 要素を追加
  participantsList.appendChild(participantEntry);

  // 新しいセレクトボックスにオプションを設定
  const rotationCycleLength = getState("scheduleData").rotationCycleLength;
  populatePositionSelects(rotationCycleLength);
}

/**
 * 現在選択されている参加者のコマ位置を取得
 * @returns {Array} コマ位置の配列
 */
function getSelectedPositions() {
  const positionSelects = document.querySelectorAll(".participant-position");
  const positions = [];

  positionSelects.forEach((select) => {
    if (select.value) {
      positions.push(parseInt(select.value, 10));
    }
  });

  return positions;
}

export { initializeParticipants, addParticipant, getSelectedPositions };
