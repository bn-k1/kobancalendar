// meetup/resultsRenderer.js - 検索結果表示のモジュール
import dayjs from "dayjs";
import { clearElement, createElement } from "../dom-util.js";

// 日本語の曜日名
dayjs.locale("ja");
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * 検索結果をテーブルに表示
 * @param {Object} results - 検索結果
 */
function renderResults(results) {
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

  if (matches.length === 0) {
    table.classList.add("hidden");
    noResultsElement.classList.remove("hidden");
    return;
  }

  table.classList.remove("hidden");
  noResultsElement.classList.add("hidden");

  // 既存の行をクリア
  clearElement(tbody);

  // 各一致に対して行を作成
  matches.forEach((match) => {
    const formattedDate = match.date.format("YYYY/MM/DD");
    const dayOfWeek = weekdays[match.date.day()];
    const isSunday = match.date.day() === 0;
    const isSaturday = match.date.day() === 6;

    // 行要素を作成
    const row = document.createElement("tr");

    // 日付セル
    const dateCell = document.createElement("td");
    dateCell.textContent = formattedDate;
    row.appendChild(dateCell);

    // 曜日セル
    const dayCell = document.createElement("td");
    dayCell.textContent = dayOfWeek;
    if (isSunday) {
      dayCell.className = "sunday";
      dayCell.style.color = "var(--error-color)";
    } else if (isSaturday) {
      dayCell.className = "saturday";
      dayCell.style.color = "var(--primary-color)";
    }
    row.appendChild(dayCell);

    // 一致数セル
    const matchCountCell = document.createElement("td");
    matchCountCell.textContent = `${match.availableCount}/${match.totalCount}`;
    row.appendChild(matchCountCell);

    // 詳細ボタンセル
    const actionCell = document.createElement("td");
    const detailsButton = createElement(
      "button",
      {
        className: "view-details",
        onclick: () => showDetailsModal(match, formattedDate, dayOfWeek),
      },
      "詳細",
    );
    actionCell.appendChild(detailsButton);
    row.appendChild(actionCell);

    // 行をテーブルに追加
    tbody.appendChild(row);
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

  // 既存の行をクリア
  clearElement(tbody);

  // 各詳細に対して行を作成
  match.details.forEach((detail) => {
    // 行要素を作成
    const row = document.createElement("tr");

    // ポジションセル
    const positionCell = document.createElement("td");
    positionCell.textContent = detail.position;
    row.appendChild(positionCell);

    // 勤務科目セル
    const subjectCell = document.createElement("td");
    subjectCell.textContent =
      detail.schedule && detail.schedule.subject
        ? detail.schedule.subject
        : "-";
    row.appendChild(subjectCell);

    // 時間セル
    const timeCell = document.createElement("td");
    timeCell.textContent =
      detail.schedule && detail.schedule.startTime && detail.schedule.endTime
        ? `${detail.schedule.startTime} - ${detail.schedule.endTime}`
        : "-";
    row.appendChild(timeCell);

    // 参加可否セル
    const availabilityCell = document.createElement("td");
    availabilityCell.textContent = detail.isAvailable ? "○" : "×";
    availabilityCell.className = detail.isAvailable
      ? "availability-yes"
      : "availability-no";
    row.appendChild(availabilityCell);

    // 行をテーブルに追加
    tbody.appendChild(row);
  });

  // モーダルを表示
  modal.classList.remove("hidden");
}

export { renderResults };
