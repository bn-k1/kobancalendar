// ui-utils.js - UI関連のユーティリティ関数
import dayjs from "dayjs";

/**
 * URLクエリパラメータを更新する関数
 * @param {Object} params - 更新するクエリパラメータオブジェクト
 */
export function updateURLParams(params) {
  const url = new URL(window.location);

  // 現在のパラメータをすべて保持しながら新しいパラメータを追加/更新
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });

  // 履歴に追加（現在のページを置き換え）
  window.history.pushState({}, "", url);
}

/**
 * URLから指定したクエリパラメータを取得する関数
 * @param {string} paramName - パラメータ名
 * @param {any} defaultValue - デフォルト値
 * @returns {string|null} パラメータの値
 */
export function getURLParam(paramName, defaultValue = null) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(paramName) ? urlParams.get(paramName) : defaultValue;
}

/**
 * ICSファイルをダウンロードするヘルパー関数
 * @param {string} icsContent - ICSファイルの内容
 * @param {dayjs} startDate - 開始日
 * @param {dayjs} endDate - 終了日
 */
export function downloadICS(icsContent, startDate, endDate) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  // ファイル名に日付範囲を含める
  const startDateStr = startDate.format("YYYYMMDD");
  const endDateStr = endDate.add(-1, "day").format("YYYYMMDD"); // 終了日は範囲の最後の日

  downloadLink.href = url;
  downloadLink.download = `schedule_${startDateStr}-${endDateStr}.ics`;

  // ダウンロードリンクを非表示で追加してクリック
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // クリーンアップ
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * 日付セルのスタイルを適用する関数
 * @param {Date} date - 日付
 * @param {HTMLElement} el - 日付セル要素
 * @param {Function} isHolidayFn - 祝日判定関数
 */
export function customizeDayCell(date, el, isHolidayFn) {
  const dateObj = dayjs(date);

  // 土曜、日曜、祝日のスタイルを設定
  if (isHolidayFn(dateObj)) {
    el.classList.add("holiday");
  }
  if (dateObj.day() === 6) {
    // 土曜日
    el.classList.add("fc-day-sat");
  }
  if (dateObj.day() === 0) {
    // 日曜日
    el.classList.add("fc-day-sun");
  }

  // 今日の日付をハイライト
  if (dateObj.isSame(dayjs().startOf("day"), "day")) {
    el.classList.add("today-highlight");
  }
}

/**
 * モーダル外クリックでモーダルを閉じる処理
 * @param {Event} e - クリックイベント
 * @param {string} modalId - モーダル要素のID
 * @param {Function} closeFn - モーダルを閉じる関数
 */
export function closeModalOnOutsideClick(e, modalId, closeFn) {
  if (e.target.id === modalId) {
    closeFn();
  }
}
