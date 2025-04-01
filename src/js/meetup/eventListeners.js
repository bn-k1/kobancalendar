// meetup/eventListeners.js - イベントリスナー管理のモジュール
import dayjs from "dayjs";
import { getState, updateCurrentBaseDate } from "../store/index.js";
import { addParticipant, getSelectedPositions } from "./participants.js";
import { renderResults } from "./resultsRenderer.js";

/**
 * イベントリスナーをセットアップ
 */
function setupEventListeners() {
  // 基準日変更イベント
  document
    .getElementById("baseDate")
    .addEventListener("change", handleBaseDateChange);

  // 参加者追加ボタン
  document
    .getElementById("addParticipantBtn")
    .addEventListener("click", addParticipant);

  // 日程検索ボタン
  document
    .getElementById("findDatesBtn")
    .addEventListener("click", handleFindDates);

  // タブ切り替え
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", handleTabChange);
  });

  // モーダル閉じるボタン
  document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("detailsModal").classList.add("hidden");
  });

  // モーダル外クリックで閉じる
  document.getElementById("detailsModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("detailsModal")) {
      document.getElementById("detailsModal").classList.add("hidden");
    }
  });

  // ESCキーでモーダルを閉じる
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      !document.getElementById("detailsModal").classList.contains("hidden")
    ) {
      document.getElementById("detailsModal").classList.add("hidden");
    }
  });
}

/**
 * 基準日変更ハンドラー
 */
function handleBaseDateChange() {
  const baseDateSelect = document.getElementById("baseDate");
  const newBaseDate = dayjs(baseDateSelect.value);
  updateCurrentBaseDate(newBaseDate);
}

/**
 * 日程検索ボタンのハンドラー
 */
function handleFindDates() {
  const positions = getSelectedPositions();

  // 入力チェック
  if (positions.length === 0) {
    alert("参加者を1人以上選択してください。");
    return;
  }

  const meetupStartTime = document.getElementById("meetupStartTime").value;
  const searchPeriod = parseInt(
    document.getElementById("searchPeriod").value,
    10,
  );
  const baseDate = getState("currentBaseDate");

  // 検索期間の設定
  const today = dayjs().startOf("day");
  const startDate = baseDate.isAfter(today) ? baseDate : today;
  const endDate = startDate.add(searchPeriod, "day");

  // MeetupFinderServiceを使って適合する日程を見つける
  const results = window.meetupFinderService.findMeetupDates(
    positions,
    meetupStartTime,
    startDate,
    endDate,
  );

  // 結果をレンダリング
  renderResults(results, positions);

  // 結果セクションを表示
  document.getElementById("results").classList.remove("hidden");

  // 全員一致タブをアクティブにする
  document.getElementById("allMatchesTab").click();
}

/**
 * タブ切り替えのハンドラー
 */
function handleTabChange(e) {
  // すべてのタブからactiveクラスを削除
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // クリックされたタブにactiveクラスを追加
  e.target.classList.add("active");

  // すべてのコンテンツを非表示
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  // 対応するコンテンツを表示
  const type = e.target.dataset.matches;
  if (type === "all") {
    document.getElementById("allMatchesContent").classList.add("active");
  } else {
    document.getElementById("partialMatchesContent").classList.add("active");
  }
}

export { setupEventListeners };
