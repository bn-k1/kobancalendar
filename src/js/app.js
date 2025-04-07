// app.js - メインアプリケーションの初期化スクリプト
import Alpine from "alpinejs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// FullCalendar
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

// CSSのインポート
import "../css/style.css";

// プロジェクト固有のモジュール
import { initializeStore } from "./store.js";
import { loadScheduleData, loadHolidays } from "./data-loader.js";
import { exportICS } from "./export.js";
import { loadConfig, loadEventConfig } from "./config.js";

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

// スケジュール管理コンポーネント
Alpine.data("scheduleManager", () => ({
  isLoaded: false,
  baseDates: [],
  selectedBaseDate: "",
  startPosition: 1,
  rotationCycleLength: 0,
  calendar: null,
  exportMonths: 3,
  isBaseDateInPast: false,

  // 初期化処理
  async init() {
    try {
      // 設定の読み込み
      await Promise.all([loadConfig(), loadEventConfig()]);

      // ストアから値を取得
      this.baseDates = Alpine.store("state").baseDates;
      this.selectedBaseDate =
        Alpine.store("state").currentBaseDate.format("YYYY-MM-DD");
      this.rotationCycleLength = 0;

      // データの読み込み
      const scheduleData = await loadScheduleData();
      Alpine.store("state").setScheduleData(scheduleData);
      this.rotationCycleLength = scheduleData.rotationCycleLength;
      await loadHolidays();

      // URLクエリパラメータから開始位置を取得
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("startNumber")) {
        const startNum = parseInt(urlParams.get("startNumber"));
        if (
          !isNaN(startNum) &&
          startNum >= 1 &&
          startNum <= this.rotationCycleLength
        ) {
          this.startPosition = startNum;
        }
      }

      // 基準日が過去か確認
      this.updateBaseDateStatus();

      // カレンダーの初期化
      this.initializeCalendar();

      this.isLoaded = true;
    } catch (error) {
      console.error("アプリケーションの初期化に失敗しました:", error);
      alert(`アプリケーションの初期化に失敗しました: ${error.message}`);
    }
  },

  // 基準日が過去かどうかの状態を更新
  updateBaseDateStatus() {
    const today = dayjs().startOf("day");
    const currentBaseDate = dayjs(this.selectedBaseDate);
    this.isBaseDateInPast = currentBaseDate.isBefore(today);
  },

  // カレンダーの初期化
  initializeCalendar() {
    const calendarEl = document.getElementById("calendar");

    this.calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      locale: "ja",
      events: [],
      datesSet: () => this.updateCalendar(),
      aspectRatio: 1.35,
      height: "auto",

      // セルのカスタマイズ
      dayCellDidMount: (info) => {
        const { date, el } = info;
        this.customizeDayCell(date, el);
      },

      // イベントコンテンツのカスタマイズ
      eventContent: this.createEventContentRenderer(),
    });

    this.calendar.render();

    // 月が変わった時にも日付セルのスタイルを適用
    this.calendar.on("datesSet", () => {
      this.applyDayCellStyles();
    });

    // 初期表示更新
    this.updateCalendar();
  },

  // 日付セルのスタイル適用
  customizeDayCell(date, el) {
    const dateObj = dayjs(date);

    // 土曜、日曜、祝日のスタイルを設定
    if (Alpine.store("state").isHoliday(dateObj)) {
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
  },

  // カレンダー内のすべての日付セルにスタイルを適用
  applyDayCellStyles() {
    if (!this.calendar) return;

    // 現在表示されているすべての日付セルを取得
    const dayCells = document.querySelectorAll(".fc-daygrid-day");

    dayCells.forEach((cell) => {
      // データ属性から日付を取得
      const dateStr = cell.getAttribute("data-date");
      if (dateStr) {
        const date = dayjs(dateStr);
        this.customizeDayCell(date, cell);
      }
    });
  },

  // イベントコンテンツレンダラーを作成
  createEventContentRenderer() {
    return (arg) => {
      let [title, startTime = "", endTime = ""] = arg.event.title.split("\n");

      // extendedPropsからデバッグ情報を取得
      const { shiftIndex } = arg.event.extendedProps;
      const dateObj = dayjs(arg.event.start);

      // 祝日名を取得
      const holidayName = Alpine.store("state").getHolidayName(dateObj);

      // デバッグ情報の文字列を作成（土日の表示は排除）
      const metaInfo = holidayName
        ? `${shiftIndex + 1} ${holidayName}`
        : `${shiftIndex + 1}`;

      return {
        html: `
          <div class="event-title">${title}</div>
          ${startTime ? `<div class="event-time">${startTime}</div>` : ""}
          ${endTime ? `<div class="event-time">${endTime}</div>` : ""}
          <div class="event-meta">${metaInfo}</div>
        `,
      };
    };
  },

  // カレンダーの更新
  updateCalendar() {
    if (!this.calendar) return;

    // 設定が読み込まれていることを確認
    if (!Alpine.store("state").isConfigLoaded()) {
      console.warn(
        "設定が完全に読み込まれていません。カレンダー更新をスキップします。",
      );
      return;
    }

    const startPosition = parseInt(this.startPosition);
    const currentBaseDate = dayjs(this.selectedBaseDate);
    const lastBaseDate = Alpine.store("state").lastBaseDate;
    const viewStartDate = dayjs(this.calendar.view.activeStart);
    const viewEndDate = dayjs(this.calendar.view.activeEnd);

    // イベントデータを一度にまとめて準備
    const calendarEvents = this.generateCalendarEvents(
      viewStartDate,
      viewEndDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    );

    // イベントの一括更新
    this.calendar.removeAllEvents();
    this.calendar.addEventSource(calendarEvents);
  },

  // 日付範囲のイベントデータを生成
  generateCalendarEvents(
    viewStartDate,
    viewEndDate,
    startPosition,
    currentBaseDate,
    lastBaseDate,
  ) {
    const calendarEvents = [];

    let currentDate = viewStartDate;
    while (currentDate.isBefore(viewEndDate)) {
      const scheduleInfo = Alpine.store("state").getScheduleForDate(
        currentDate,
        startPosition,
        currentBaseDate,
        lastBaseDate,
      );

      if (!scheduleInfo) {
        currentDate = currentDate.add(1, "day");
        continue;
      }

      const {
        dateStr,
        subject,
        startTime,
        endTime,
        isHoliday,
        isSaturday,
        shiftIndex,
      } = scheduleInfo;

      try {
        // イベントの準備
        const { config } = Alpine.store("state").getEventType(subject);
        calendarEvents.push({
          title: config.showTime
            ? `${subject}\n${startTime} - \n${endTime}`
            : subject,
          start: dateStr,
          color: config.color,
          // 追加のメタデータ
          extendedProps: {
            startTime,
            endTime,
            isShift: true,
            isHoliday,
            isSaturday,
            shiftIndex,
          },
        });
      } catch (error) {
        console.error(
          `日付 ${dateStr} のイベント処理中にエラーが発生しました:`,
          error,
        );
        // エラーが発生しても処理を続行
      }

      currentDate = currentDate.add(1, "day");
    }

    return calendarEvents;
  },

  // 基準日変更処理
  handleBaseDateChange() {
    const newBaseDate = dayjs(this.selectedBaseDate);
    Alpine.store("state").updateCurrentBaseDate(newBaseDate);
    this.updateBaseDateStatus();
    this.updateURLParams();
    this.updateCalendar();
  },

  // URLパラメータの更新
  updateURLParams() {
    const url = new URL(window.location);
    url.searchParams.set("baseDate", this.selectedBaseDate);
    url.searchParams.set("startNumber", this.startPosition);
    window.history.pushState({}, "", url);
  },

  // ICSエクスポート処理
  handleExportICS() {
    const months = parseInt(this.exportMonths);
    const startNumber = parseInt(this.startPosition);
    exportICS(
      months,
      startNumber,
      dayjs(this.selectedBaseDate),
      Alpine.store("state").lastBaseDate,
    );
  },
}));

// Alpine.jsを起動
window.Alpine = Alpine;
Alpine.start();
