// meetup.js - 飲み会調整機能の実装
import Alpine from "alpinejs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// CSSのインポート
import "../css/style.css";
import "../css/meetup.css";

// プロジェクト固有のモジュール
import { initializeStore } from "./store.js";
import { loadScheduleData } from "./schedule-service.js";
import { loadHolidays } from "./holiday-service.js";
import { loadConfig, loadEventConfig } from "./config.js";
import { canAttendMeetup } from "./event-service.js";
import { getWeekdayName, getDayClass } from "./date-utils.js";
import { closeModalOnOutsideClick } from "./ui-utils.js";
import { tryCatchAsync, handleError } from "./error-handler.js";
import {
  APP_CONFIG,
  DATE_FORMATS,
  WEEKDAYS,
  ERROR_MESSAGES,
} from "./constants.js";

// CSVデータのインポート
import holidayData from "@data/holiday.csv";
import saturdayData from "@data/saturday.csv";
import weekdayData from "@data/weekday.csv";

// Day.jsプラグインの設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.tz.setDefault("Asia/Tokyo");

// Alpineストアの初期化
document.addEventListener("alpine:init", () => {
  initializeStore();
});

// 飲み会調整コンポーネント
Alpine.data("meetupFinder", () => ({
  isLoaded: false,
  baseDates: [],
  selectedBaseDate: "",
  participants: [{ position: "" }],
  meetupStartTime: APP_CONFIG.DEFAULT_MEETUP_START_TIME,
  searchPeriod: APP_CONFIG.DEFAULT_SEARCH_PERIOD,
  rotationCycleLength: 0,
  results: { allMatches: [], partialMatches: [] },
  showResults: false,
  activeTab: "all",
  showModal: false,
  currentDetails: { details: [] },
  modalTitle: "",

  // 初期化処理
  async init() {
    await tryCatchAsync(async () => {
      // 設定の読み込み
      await Promise.all([loadConfig(), loadEventConfig()]);

      // ストアから値を取得
      this.baseDates = Alpine.store("state").baseDates;
      this.selectedBaseDate = Alpine.store("state").currentBaseDate.format(
        DATE_FORMATS.ISO_DATE,
      );

      // データの読み込み
      const scheduleData = await loadScheduleData(
        holidayData,
        saturdayData,
        weekdayData,
      );
      Alpine.store("state").setScheduleData(scheduleData);
      this.rotationCycleLength = scheduleData.rotationCycleLength;

      // 祝日データの読み込み
      const store = Alpine.store("state");
      await loadHolidays();

      this.isLoaded = true;
    }, ERROR_MESSAGES.INIT_FAILED);
  },

  // 基準日変更処理
  handleBaseDateChange() {
    const newBaseDate = dayjs(this.selectedBaseDate);
    Alpine.store("state").updateCurrentBaseDate(newBaseDate);
  },

  // 参加者追加
  addParticipant() {
    this.participants.push({ position: "" });
  },

  // 参加者削除
  removeParticipant(index) {
    this.participants.splice(index, 1);
  },

  // 日程検索
  findDates() {
    // 有効な参加者のポジションを取得
    const positions = this.participants
      .map((p) => parseInt(p.position))
      .filter((p) => !isNaN(p));

    // 入力チェック
    if (positions.length === 0) {
      alert(ERROR_MESSAGES.NO_PARTICIPANTS);
      return;
    }

    // 参加者が1人の場合に確認アラート
    if (positions.length === 1) {
      alert("行ってこい！");
      return;
    }

    // 検索期間の設定
    const baseDate = dayjs(this.selectedBaseDate);
    const today = dayjs().startOf("day");
    const startDate = baseDate.isAfter(today) ? baseDate : today;
    const endDate = startDate.add(this.searchPeriod, "day");

    // 検索実行
    this.results = this.findMeetupDates(
      positions,
      this.meetupStartTime,
      startDate,
      endDate,
    );
    this.showResults = true;
    this.activeTab = "all";
  },

  // 飲み会可能日検索機能
  findMeetupDates(positions, meetupStartTime, startDate, endDate) {
    const result = {
      allMatches: [], // 全員参加可能な日
      partialMatches: [], // 部分的に参加可能な日
    };

    // 基準日の設定
    const currentBaseDate = dayjs(this.selectedBaseDate);
    const lastBaseDate = Alpine.store("state").lastBaseDate;

    // 日付ごとに検索
    let currentDate = dayjs(startDate);
    while (currentDate.isBefore(endDate)) {
      const dateResults = this.checkDateForPositions(
        currentDate,
        positions,
        meetupStartTime,
        currentBaseDate,
        lastBaseDate,
      );

      // 全員参加可能な場合
      if (dateResults.availablePositions.length === positions.length) {
        result.allMatches.push({
          date: currentDate,
          availableCount: dateResults.availablePositions.length,
          totalCount: positions.length,
          details: dateResults.details,
        });
      }
      // 一部参加可能な場合（最低1人以上が参加可能）
      else if (dateResults.availablePositions.length > 0) {
        result.partialMatches.push({
          date: currentDate,
          availableCount: dateResults.availablePositions.length,
          totalCount: positions.length,
          details: dateResults.details,
        });
      }

      currentDate = currentDate.add(1, "day");
    }

    // 日付でソート
    result.allMatches.sort((a, b) => a.date.unix() - b.date.unix());
    result.partialMatches.sort((a, b) => {
      // まず参加可能人数で降順、同じ場合は日付で昇順
      if (b.availableCount !== a.availableCount) {
        return b.availableCount - a.availableCount;
      }
      return a.date.unix() - b.date.unix();
    });

    return result;
  },

  // 特定の日付について、各コマ位置の参加可否を確認
  checkDateForPositions(
    date,
    positions,
    meetupStartTime,
    currentBaseDate,
    lastBaseDate,
  ) {
    const result = {
      availablePositions: [],
      details: [],
    };

    for (const position of positions) {
      // その日のスケジュールを取得
      const schedule = Alpine.store("state").getScheduleForDate(
        date,
        position,
        currentBaseDate,
        lastBaseDate,
      );

      // 参加可否を判定
      const isAvailable = canAttendMeetup(
        schedule,
        meetupStartTime,
        Alpine.store("state").eventConfig,
      );

      // 詳細情報を記録
      result.details.push({
        position,
        schedule,
        isAvailable,
      });

      // 参加可能なら記録
      if (isAvailable) {
        result.availablePositions.push(position);
      }
    }

    return result;
  },

  // 詳細を表示
  showDetails(match) {
    this.currentDetails = match;
    this.modalTitle = `${match.date.format(DATE_FORMATS.DISPLAY_DATE)}（${this.getWeekday(match.date)}）詳細`;
    this.showModal = true;
  },

  // 曜日名を取得
  getWeekday(date) {
    return getWeekdayName(date);
  },

  // 日付クラスを取得
  getDayClass(date) {
    return getDayClass(date);
  },

  // モーダル外クリックで閉じる
  closeModalOnOutsideClick(e) {
    closeModalOnOutsideClick(e, "detailsModal", () => {
      this.showModal = false;
    });
  },

  // 時間表示形式を取得
  getTimeDisplay(detail) {
    return detail.schedule &&
      detail.schedule.startTime &&
      detail.schedule.endTime
      ? `${detail.schedule.startTime} - ${detail.schedule.endTime}`
      : "-";
  },
}));

// Alpine.jsを起動
window.Alpine = Alpine;
Alpine.start();
