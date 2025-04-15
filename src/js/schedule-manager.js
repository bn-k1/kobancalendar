// schedule-manager.js - スケジュール管理Alpine.jsコンポーネント
import Alpine from "alpinejs";
import dayjs from "dayjs";
import { initializeCalendar, updateCalendar } from "./calendar.js";
import { exportICS } from "./export.js";
import { updateURLParams, getNumberParam } from "./utils.js";
import { isBaseDateInPast } from "./utils.js";
import { handleError } from "./utils.js";
import { APP_CONFIG, DATE_FORMATS, ERROR_MESSAGES } from "./constants.js";
import { initializeApplication } from "./app-initialization.js";

// スケジュール管理コンポーネント
export function registerScheduleManager() {
  Alpine.data("scheduleManager", () => ({
    isLoaded: false,
    baseDates: [],
    selectedBaseDate: "",
    startPosition: APP_CONFIG.DEFAULT_START_POSITION,
    rotationCycleLength: 0,
    calendar: null,
    exportMonths: APP_CONFIG.DEFAULT_EXPORT_MONTHS,
    isBaseDateInPast: false,

    // Alpine外部のデータをキャッシュするためのプロパティ
    _state: null,
    _calendarView: { start: null, end: null },
    _lastUpdateTime: 0,

    // Alpine初期化処理
    async init() {
      this.isLoaded = false;

      // アプリケーションデータの初期化
      const result = await initializeApplication();

      if (!result.success) {
        this.isLoaded = false;
        return;
      }

      // ストアから値を取得
      this._state = Alpine.store("state");
      this.baseDates = this._state.baseDates;
      this.selectedBaseDate = this._state.currentBaseDate.format(
        DATE_FORMATS.ISO_DATE,
      );
      this.rotationCycleLength = result.scheduleData.rotationCycleLength;

      // URLクエリパラメータから開始位置を取得
      this.startPosition = getNumberParam(
        "startNumber",
        APP_CONFIG.DEFAULT_START_POSITION,
        1,
        this.rotationCycleLength,
      );

      // 基準日が過去か確認
      this.updateBaseDateStatus();

      // カレンダーの初期化
      this.initializeCalendarComponent();

      this.isLoaded = true;

      // データロード完了後にカレンダーを更新
      this.$nextTick(() => {
        this.updateCalendar();
      });
    },

    // カレンダーコンポーネントの初期化
    initializeCalendarComponent() {
      try {
        const currentBaseDate = dayjs(this.selectedBaseDate);
        const today = dayjs().startOf("day");
        const initialDate = currentBaseDate.isSameOrAfter(today)
          ? currentBaseDate
          : null;

        this.calendar = initializeCalendar(initialDate);

        if (this.calendar) {
          this.calendar.on("datesSet", this.handleCalendarDatesSet.bind(this));
        }
      } catch (error) {
        handleError(error, ERROR_MESSAGES.CALENDAR_INIT_FAILED);
      }
    },

    // カレンダー日付変更イベントハンドラ
    handleCalendarDatesSet(info) {
      const now = Date.now();
      if (now - this._lastUpdateTime < 200) return;

      const newStart = dayjs(info.view.activeStart);
      const newEnd = dayjs(info.view.activeEnd);

      if (
        !this._calendarView.start ||
        !this._calendarView.end ||
        !newStart.isSame(this._calendarView.start) ||
        !newEnd.isSame(this._calendarView.end)
      ) {
        this._calendarView.start = newStart;
        this._calendarView.end = newEnd;

        this._lastUpdateTime = now;
        this.updateCalendar();
      }
    },

    // 基準日状態更新
    updateBaseDateStatus() {
      this.isBaseDateInPast = isBaseDateInPast(this.selectedBaseDate);
    },

    // カレンダー更新
    updateCalendar() {
      if (!this.calendar || !this.isLoaded) return;

      setTimeout(() => {
        updateCalendar(
          this.calendar,
          parseInt(this.startPosition),
          dayjs(this.selectedBaseDate),
          this._state.lastBaseDate,
        );
      }, 0);
    },

    // 基準日変更処理
    handleBaseDateChange() {
      const newBaseDate = dayjs(this.selectedBaseDate);
      this._state.updateCurrentBaseDate(newBaseDate);
      this.updateBaseDateStatus();
      this.updateURLParams();

      if (this.calendar) {
        const today = dayjs().startOf("day");
        if (newBaseDate.isSameOrAfter(today)) {
          this.calendar.gotoDate(newBaseDate.toDate());
        } else {
          this.calendar.gotoDate(today.toDate());
        }
      }
    },

    // コマ位置変更処理
    handlePositionChange() {
      this.updateURLParams();
      this.updateCalendar();
    },

    // URLパラメータの更新
    updateURLParams() {
      setTimeout(() => {
        updateURLParams({
          baseDate: this.selectedBaseDate,
          startNumber: this.startPosition,
        });
      }, 0);
    },

    // ICSエクスポート処理
    handleExportICS() {
      const months = parseInt(this.exportMonths);
      const startNumber = parseInt(this.startPosition);

      setTimeout(() => {
        exportICS(
          months,
          startNumber,
          dayjs(this.selectedBaseDate),
          this._state.lastBaseDate,
        );
      }, 0);
    },
  }));
}
