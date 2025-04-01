// meetup/main.js - 飲み会調整機能のメインスクリプト
import dayjs from "dayjs";
import "../../css/style.css"; // スタイルシートをインポート
import "../../css/meetup.css"; // スタイルシートをインポート
import { loadConfig, loadEventConfig } from "../config.js";
import { loadScheduleData, loadHolidays } from "../data-loader.js";
import { getState, setScheduleData } from "../store/index.js";
// updateBaseDateSectionは再利用するが、showControlSectionsは使わない
// meetup専用のUIモジュールを使用
import { initializeMeetupUI } from "./meetupUI.js";
import { initializeParticipants } from "./participants.js";
import { setupEventListeners } from "./eventListeners.js";
import { MeetupFinderService } from "./meetupFinderService.js";

// グローバル変数として MeetupFinderService のインスタンスを保持
window.meetupFinderService = null;

/**
 * アプリケーションの初期化
 */
async function initializeApp() {
  try {
    // 設定の読み込み
    await Promise.all([loadConfig(), loadEventConfig()]);

    // データの読み込み
    setScheduleData(await loadScheduleData());
    await loadHolidays();

    // UIの初期化 - meetup専用のUIモジュールを使用
    initializeMeetupUI(getState("baseDates"), getState("currentBaseDate"));
    initializeParticipants();

    // MeetupFinderService のインスタンスを作成
    window.meetupFinderService = new MeetupFinderService();

    // イベントリスナーの設定
    setupEventListeners();
  } catch (error) {
    console.error("アプリケーションの初期化に失敗しました:", error);
    alert(`アプリケーションの初期化に失敗しました: ${error.message}`);
  }
}

// ページ読み込み時の処理
window.addEventListener("DOMContentLoaded", initializeApp);
