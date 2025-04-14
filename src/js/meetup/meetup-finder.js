// meetup/meetup-finder.js - 飲み会調整コンポーネント
import Alpine from "alpinejs";
import dayjs from "dayjs";
import { handleError } from "../error-handler.js";
import {
  findMeetupDates,
  checkDateForPositions,
} from "./availability-service.js";
import { getWeekdayName, getDayClass } from "../date-utils.js";
import { closeModalOnOutsideClick } from "../ui-utils.js";
import { loadScheduleData } from "../schedule-service.js";
import { loadHolidays } from "../holiday-service.js";
import { loadConfig, loadEventConfig } from "../config.js";
import { APP_CONFIG, DATE_FORMATS, ERROR_MESSAGES } from "../constants.js";

// CSVデータのインポート
import holidayData from "@data/holiday.csv";
import saturdayData from "@data/saturday.csv";
import weekdayData from "@data/weekday.csv";

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
    try {
      loadConfig();
      loadEventConfig();

      // ストアから値を取得
      this.baseDates = Alpine.store("state").baseDates;
      this.selectedBaseDate = Alpine.store("state").currentBaseDate.format(
        DATE_FORMATS.ISO_DATE,
      );

      // データの読み込み
      const scheduleData = loadScheduleData(
        holidayData,
        saturdayData,
        weekdayData,
      );
      Alpine.store("state").setScheduleData(scheduleData);
      this.rotationCycleLength = scheduleData.rotationCycleLength;

      // 祝日データの読み込み
      loadHolidays();

      this.isLoaded = true;
    } catch (error) {
      handleError(error, ERROR_MESSAGES.INIT_FAILED);
    }
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
      alert(ERROR_MESSAGES.GOAHEAD);
      return;
    }

    // 検索期間の設定
    const baseDate = dayjs(this.selectedBaseDate);
    const today = dayjs().startOf("day");
    const startDate = baseDate.isAfter(today) ? baseDate : today;
    const endDate = startDate.add(this.searchPeriod, "day");

    // 検索実行
    this.results = findMeetupDates(
      positions,
      this.meetupStartTime,
      startDate,
      endDate,
      this.selectedBaseDate,
      Alpine.store("state").lastBaseDate,
      this.checkDateForPositions.bind(this),
    );
    this.showResults = true;
    this.activeTab = "all";
  },

  // 特定の日付について、各コマ位置の参加可否を確認（ラッパー）
  checkDateForPositions(date, positions, meetupStartTime) {
    return checkDateForPositions(
      date,
      positions,
      meetupStartTime,
      dayjs(this.selectedBaseDate),
      Alpine.store("state").lastBaseDate,
    );
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

  // 現在の日の勤務内容を取得
  getCurrentDayShift(detail) {
    if (
      !detail ||
      !detail.position ||
      !this.currentDetails ||
      !this.currentDetails.date
    ) {
      return "-";
    }

    // 現在の日付を取得
    const currentDay = this.currentDetails.date;

    // 現在の日のスケジュールを取得
    const currentDaySchedule = Alpine.store("state").getScheduleForDate(
      currentDay,
      detail.position,
      dayjs(this.selectedBaseDate),
      Alpine.store("state").lastBaseDate,
    );

    // 現在の日の勤務内容を整形して返す
    if (currentDaySchedule && currentDaySchedule.subject) {
      // その他の勤務の場合は開始時間と終了時間を表示
      if (currentDaySchedule.endTime) {
        return `${currentDaySchedule.subject}(~${currentDaySchedule.endTime})`;
      }

      return currentDaySchedule.subject;
    }

    return "-";
  },

  //  翌日の勤務内容を取得
  getNextDayShift(detail) {
    if (
      !detail ||
      !detail.position ||
      !this.currentDetails ||
      !this.currentDetails.date
    ) {
      return "-";
    }

    // 翌日の日付を計算
    const nextDay = this.currentDetails.date.add(1, "day");

    // 翌日のスケジュールを取得
    const nextDaySchedule = Alpine.store("state").getScheduleForDate(
      nextDay,
      detail.position,
      dayjs(this.selectedBaseDate),
      Alpine.store("state").lastBaseDate,
    );

    // 翌日の勤務内容を整形して返す
    if (nextDaySchedule && nextDaySchedule.subject) {
      // その他の勤務の場合は開始時間も表示
      if (nextDaySchedule.startTime) {
        return `${nextDaySchedule.subject}(${nextDaySchedule.startTime}~)`;
      }

      return nextDaySchedule.subject;
    }

    return "-";
  },
}));
