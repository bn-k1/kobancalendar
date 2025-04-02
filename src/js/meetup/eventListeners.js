// meetup/eventListeners.js - イベントリスナー管理のモジュール
import dayjs from "dayjs";
import { getState, updateCurrentBaseDate } from "../store/index.js";
import { addParticipant, getSelectedPositions } from "./participants.js";
import { renderResults } from "./resultsRenderer.js";

/**
 * イベントリスナーをセットアップ
 */
function setupEventListeners() {
  // イベントリスナー登録を関数で抽象化
  function addListener(selector, event, handler) {
    const element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (element) {
      element.addEventListener(event, handler);
    }
  }

  // 複数要素へのイベントリスナー登録
  function addListenerAll(selector, event, handler) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.addEventListener(event, handler);
    });
  }

  // 基準日変更イベント
  addListener("#baseDate", "change", handleBaseDateChange);

  // 参加者追加ボタン
  addListener("#addParticipantBtn", "click", addParticipant);

  // 日程検索ボタン
  addListener("#findDatesBtn", "click", handleFindDates);

  // タブ切り替え
  addListenerAll(".tab-btn", "click", handleTabChange);

  // モーダル閉じるボタン
  addListener(".close-modal", "click", () => {
    document.getElementById("detailsModal").classList.add("hidden");
  });

  // モーダル外クリックで閉じる
  addListener("#detailsModal", "click", (e) => {
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
  renderResults(results);

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
  const contentSelector =
    type === "all" ? "#allMatchesContent" : "#partialMatchesContent";
  document.querySelector(contentSelector).classList.add("active");
}

export { setupEventListeners };
