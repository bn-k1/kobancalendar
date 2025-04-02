// meetup/resultsRenderer.js - 検索結果表示のモジュール
import dayjs from "dayjs";
import { html, render } from "../htm-util.js";

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

  // HTMを使ってテーブル行を生成
  const rows = matches.map((match) => {
    const formattedDate = match.date.format("YYYY/MM/DD");
    const dayOfWeek = weekdays[match.date.day()];
    const isSunday = match.date.day() === 0;
    const isSaturday = match.date.day() === 6;

    // 曜日の色設定
    const dayStyle = isSunday
      ? { color: "var(--error-color)" }
      : isSaturday
        ? { color: "var(--primary-color)" }
        : {};

    // 曜日のクラス
    const dayClass = isSunday ? "sunday" : isSaturday ? "saturday" : "";

    return html`
      <tr>
        <td>${formattedDate}</td>
        <td class=${dayClass} style=${dayStyle}>${dayOfWeek}</td>
        <td>${match.availableCount}/${match.totalCount}</td>
        <td>
          <button
            class="view-details"
            onclick=${() => showDetailsModal(match, formattedDate, dayOfWeek)}
          >
            詳細
          </button>
        </td>
      </tr>
    `;
  });

  // レンダリング
  render(rows, tbody);
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

  // HTMを使って詳細テーブル行を生成
  const detailRows = match.details.map((detail) => {
    // 勤務内容の表示
    const subject =
      detail.schedule && detail.schedule.subject
        ? detail.schedule.subject
        : "-";

    // 時間の表示
    const time =
      detail.schedule && detail.schedule.startTime && detail.schedule.endTime
        ? `${detail.schedule.startTime} - ${detail.schedule.endTime}`
        : "-";

    // 参加可否の表示
    const availabilityText = detail.isAvailable ? "○" : "×";
    const availabilityClass = detail.isAvailable
      ? "availability-yes"
      : "availability-no";

    return html`
      <tr>
        <td>${detail.position}</td>
        <td>${subject}</td>
        <td>${time}</td>
        <td class=${availabilityClass}>${availabilityText}</td>
      </tr>
    `;
  });

  // レンダリング
  render(detailRows, tbody);

  // モーダルを表示
  modal.classList.remove("hidden");
}

export { renderResults };
