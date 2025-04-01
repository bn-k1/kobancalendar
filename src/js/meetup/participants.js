// meetup/participants.js - 参加者管理のモジュール
import { getState } from "../store/index.js";

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
  
  positionSelects.forEach(select => {
    // 選択されていた値を保持
    const selectedValue = select.value;
    
    // 既存のオプションをクリア (最初の「コマ位置を選択」オプションは除く)
    const firstOption = select.querySelector('option[disabled]');
    select.innerHTML = '';
    if (firstOption) {
      select.appendChild(firstOption);
    }
    
    // 新しいオプションを追加
    for (let i = 1; i <= rotationCycleLength; i++) {
      const option = document.createElement("option");
      option.value = i.toString();
      option.textContent = i.toString();
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
  const newEntry = document.createElement("div");
  newEntry.className = "participant-entry";
  
  // コマ位置選択のセレクトボックス
  const select = document.createElement("select");
  select.className = "participant-position";
  select.setAttribute("aria-label", "参加者のコマ位置");
  
  // 最初のオプション (プレースホルダ)
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "コマ位置を選択";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  select.appendChild(placeholderOption);
  
  // 削除ボタン
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-participant";
  removeBtn.setAttribute("aria-label", "この参加者を削除");
  removeBtn.textContent = "✕";
  removeBtn.addEventListener("click", function() {
    participantsList.removeChild(newEntry);
  });
  
  // 要素を追加
  newEntry.appendChild(select);
  newEntry.appendChild(removeBtn);
  participantsList.appendChild(newEntry);
  
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
  
  positionSelects.forEach(select => {
    if (select.value) {
      positions.push(parseInt(select.value, 10));
    }
  });
  
  return positions;
}

export { initializeParticipants, addParticipant, getSelectedPositions };