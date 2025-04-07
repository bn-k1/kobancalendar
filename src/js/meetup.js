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
import { loadScheduleData, loadHolidays } from "./data-loader.js";
import { loadConfig, loadEventConfig } from "./config.js";
import { getWeekdayName, getDayClass } from "./utils.js";

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
  meetupStartTime: "17:00", // HTMLでデフォルト値が17:00なので合わせる
  searchPeriod: 30,
  rotationCycleLength: 0,
  results: { allMatches: [], partialMatches: [] },
  showResults: false,
  activeTab: "all",
  showModal: false,
  currentDetails: { details: [] }, // 空のオブジェクトをデフォルト値として設定
  modalTitle: "",

  // 初期化処理
  async init() {
    try {
      // 設定の読み込み
      await Promise.all([loadConfig(), loadEventConfig()]);

      // ストアから値を取得
      this.baseDates = Alpine.store("state").baseDates;
      this.selectedBaseDate =
        Alpine.store("state").currentBaseDate.format("YYYY-MM-DD");

      // データの読み込み
      const scheduleData = await loadScheduleData();
      Alpine.store("state").setScheduleData(scheduleData);
      this.rotationCycleLength = scheduleData.rotationCycleLength;
      await loadHolidays();

      this.isLoaded = true;
    } catch (error) {
      console.error("アプリケーションの初期化に失敗しました:", error);
      alert(`アプリケーションの初期化に失敗しました: ${error.message}`);
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
      alert("参加者を1人以上選択してください。");
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
      const isAvailable = this.canAttendMeetup(schedule, meetupStartTime);

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

  // 飲み会に参加可能かどうかを判定
  canAttendMeetup(schedule, meetupStartTime) {
    if (!schedule) return false;

    const { subject, endTime } = schedule;
    const eventConfig = Alpine.store("state").eventConfig;

    // 公休、法休などの休日タイプを設定から取得
    if (eventConfig && eventConfig.events) {
      const restDayConfig = eventConfig.events.restDay;

      // 設定から取得した休日キーワードを使用して判定
      if (restDayConfig && restDayConfig.keywords) {
        if (restDayConfig.keywords.some((keyword) => subject === keyword)) {
          return true;
        }
      }
    }

    // 勤務終了時間が設定されていない場合は参加不可
    if (!endTime) {
      return false;
    }

    // 勤務終了時間を解析
    const [endHour, endMinute = "00"] = endTime.split(":");
    const endTimeObj = dayjs()
      .hour(parseInt(endHour, 10))
      .minute(parseInt(endMinute, 10));

    // 飲み会開始時間を解析
    const [meetupHour, meetupMinute = "00"] = meetupStartTime.split(":");
    const meetupTimeObj = dayjs()
      .hour(parseInt(meetupHour, 10))
      .minute(parseInt(meetupMinute, 10));

    // 夜勤の場合（終了時間が24:00以降）は参加不可
    if (parseInt(endHour, 10) >= 24) {
      return false;
    }

    // 勤務終了時間が飲み会開始時間より前なら参加可能
    return endTimeObj.isBefore(meetupTimeObj);
  },

  // 詳細を表示
  showDetails(match) {
    this.currentDetails = match;
    this.modalTitle = `${match.date.format("YYYY/MM/DD")}（${getWeekdayName(match.date)}）詳細`;
    this.showModal = true;
  },

  // モーダル外クリックで閉じる
  closeModalOnOutsideClick(e) {
    if (e.target.id === "detailsModal") {
      this.showModal = false;
    }
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
