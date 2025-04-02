// meetup/participants.js - 参加者管理のモジュール
import { getState } from "../store/index.js";
import { html, render } from "../htm-util.js";

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
    let placeholder = null;

    if (firstOption) {
      placeholder = html`<option value="" disabled>
        ${firstOption.textContent}
      </option>`;
    } else {
      placeholder = html`<option value="" disabled>コマ位置を選択</option>`;
    }

    // HTMを使ってオプションを生成
    const options = [
      placeholder,
      ...Array.from({ length: rotationCycleLength }, (_, i) => {
        const value = (i + 1).toString();
        return html`<option value=${value}>${value}</option>`;
      }),
    ];

    // レンダリング
    render(options, select);

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

  // HTMを使って新しい参加者行を生成
  const participantEntryTemplate = html`
    <div class="participant-entry">
      <select class="participant-position" aria-label="参加者のコマ位置">
        <option value="" disabled selected>コマ位置を選択</option>
      </select>
      <button class="remove-participant" aria-label="この参加者を削除">
        ✕
      </button>
    </div>
  `;

  // DOMノードを生成
  const tempDiv = document.createElement("div");
  render(participantEntryTemplate, tempDiv);
  const newEntry = tempDiv.firstChild;

  // 削除ボタンにイベントリスナーを追加
  const removeBtn = newEntry.querySelector(".remove-participant");
  removeBtn.addEventListener("click", function () {
    participantsList.removeChild(newEntry);
  });

  // 要素を追加
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

  positionSelects.forEach((select) => {
    if (select.value) {
      positions.push(parseInt(select.value, 10));
    }
  });

  return positions;
}

export { initializeParticipants, addParticipant, getSelectedPositions };
