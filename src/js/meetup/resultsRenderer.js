// meetup/resultsRenderer.js - 検索結果表示のモジュール
import dayjs from "dayjs";
import ja from "dayjs/locale/ja";
import { getEventType } from "./events.js";

// 日本語の曜日名
dayjs.locale("ja");
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * 検索結果をテーブルに表示
 * @param {Object} results - 検索結果
 * @param {Array} positions - 参加者のコマ位置
 */
function renderResults(results, positions) {
  // 全員一致の結果をレンダリング
  renderMatchTable(
    "allMatchesTable",
    results.allMatches,
    document.querySelector("#allMatchesContent .no-results-message"),
  );

  // 部分一致の結果をレンダリング
  renderMatchTable(
    "partialMatchesTable",
    results.partialMatches,
    document.querySelector("#partialMatchesContent .no-results-message"),
  );
}

/**
 * 特定のテーブルに結果をレンダリング
 * @param {string} tableId - テーブルのID
 * @param {Array} matches - 一致結果の配列
 * @param {Element} noResultsElement - 結果がない場合に表示する要素
 */
function renderMatchTable(tableId, matches, noResultsElement) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  if (matches.length === 0) {
    table.classList.add("hidden");
    noResultsElement.classList.remove("hidden");
    return;
  }

  table.classList.remove("hidden");
  noResultsElement.classList.add("hidden");

  matches.forEach((match, index) => {
    const tr = document.createElement("tr");

    // 日付
    const formattedDate = match.date.format("YYYY/MM/DD");
    const tdDate = document.createElement("td");
    tdDate.textContent = formattedDate;
    tr.appendChild(tdDate);

    // 曜日
    const dayOfWeek = weekdays[match.date.day()];
    const tdDay = document.createElement("td");
    tdDay.textContent = dayOfWeek;

    // 曜日によってクラスを追加
    if (match.date.day() === 0) {
      // 日曜
      tdDay.classList.add("sunday");
      tdDay.style.color = "var(--error-color)";
    } else if (match.date.day() === 6) {
      // 土曜
      tdDay.classList.add("saturday");
      tdDay.style.color = "var(--primary-color)";
    }

    tr.appendChild(tdDay);

    // 利用可能な人数
    const tdCount = document.createElement("td");
    tdCount.textContent = `${match.availableCount}/${match.totalCount}`;
    tr.appendChild(tdCount);

    // 詳細ボタン
    const tdDetails = document.createElement("td");
    const detailsBtn = document.createElement("button");
    detailsBtn.className = "view-details";
    detailsBtn.textContent = "詳細";
    detailsBtn.addEventListener("click", () => {
      showDetailsModal(match, formattedDate, dayOfWeek);
    });
    tdDetails.appendChild(detailsBtn);
    tr.appendChild(tdDetails);

    tbody.appendChild(tr);
  });
}

/**
 * 詳細モーダルを表示
 * @param {Object} match - 一致結果
 * @param {string} formattedDate - フォーマットされた日付
 * @param {string} dayOfWeek - 曜日
 */
function showDetailsModal(match, formattedDate, dayOfWeek) {
  const modal = document.getElementById("detailsModal");
  const modalDate = document.getElementById("modalDate");
  const detailsTable = document.getElementById("detailsTable");
  const tbody = detailsTable.querySelector("tbody");

  // モーダルのタイトルを設定
  modalDate.textContent = `${formattedDate}（${dayOfWeek}）詳細`;

  // テーブルをクリア
  tbody.innerHTML = "";

  // 詳細情報を表示
  match.details.forEach((detail) => {
    const tr = document.createElement("tr");

    // コマ位置
    const tdPosition = document.createElement("td");
    tdPosition.textContent = detail.position;
    tr.appendChild(tdPosition);

    // 勤務内容
    const tdSubject = document.createElement("td");
    if (detail.schedule && detail.schedule.subject) {
      tdSubject.textContent = detail.schedule.subject;
    } else {
      tdSubject.textContent = "-";
    }
    tr.appendChild(tdSubject);

    // 時間
    const tdTime = document.createElement("td");
    if (
      detail.schedule &&
      detail.schedule.startTime &&
      detail.schedule.endTime
    ) {
      tdTime.textContent = `${detail.schedule.startTime} - ${detail.schedule.endTime}`;
    } else {
      tdTime.textContent = "-";
    }
    tr.appendChild(tdTime);

    // 参加可否
    const tdAvailability = document.createElement("td");
    if (detail.isAvailable) {
      tdAvailability.textContent = "○";
      tdAvailability.className = "availability-yes";
    } else {
      tdAvailability.textContent = "×";
      tdAvailability.className = "availability-no";
    }
    tr.appendChild(tdAvailability);

    tbody.appendChild(tr);
  });

  // モーダルを表示
  modal.classList.remove("hidden");
}

export { renderResults };
