// store.js - Alpine.js によるストア実装
import Alpine from "alpinejs";
import dayjs from "dayjs";

// ストア初期化
export function initializeStore() {
  Alpine.store("state", {
    // データ
    scheduleData: {
      holiday: [],
      saturday: [],
      weekday: [],
      rotationCycleLength: 0,
    },
    baseDates: [],
    currentBaseDate: null,
    lastBaseDate: null,
    holidayYearsRange: 0,
    userDefinedHolidays: [],
    icsExportConfig: {},
    eventConfig: null,
    allHolidays: {},

    // メソッド
    updateCurrentBaseDate(newBaseDate) {
      this.currentBaseDate = newBaseDate;
      return this.currentBaseDate;
    },

    isConfigLoaded() {
      return this.eventConfig !== null;
    },

    setScheduleData(data) {
      this.scheduleData = data;
    },

    setHolidays(holidays) {
      this.allHolidays = holidays;
    },

    isHoliday(date) {
      // 引数が dayjs オブジェクトではない場合、変換する
      const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
      const dateStr = dateObj.format("YYYY-MM-DD");
      return this.allHolidays[dateStr] !== undefined || dateObj.day() === 0; // day()は0が日曜
    },

    getHolidayName(date) {
      // 引数が dayjs オブジェクトではない場合、変換する
      const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
      const dateStr = dateObj.format("YYYY-MM-DD");
      return this.allHolidays[dateStr];
    },

    getEventType(subject) {
      if (!this.eventConfig || !this.eventConfig.events) {
        console.error("イベント設定が読み込まれていないか無効です");
        return {
          type: "default",
          config: this.eventConfig?.events?.default || {},
        };
      }

      // events オブジェクト内のすべてのイベントタイプを確認
      for (const [type, config] of Object.entries(this.eventConfig.events)) {
        // default 以外のイベントタイプの場合、キーワードをチェック
        if (
          type !== "default" &&
          config.keywords &&
          config.keywords.some((keyword) => subject?.includes(keyword))
        ) {
          return { type, config };
        }
      }

      // どのイベントタイプにも該当しなかった場合、default設定を返す
      return {
        type: "default",
        config: this.eventConfig.events.default,
      };
    },

    calculateShiftIndex(targetDate, startPosition, currentBaseDate) {
      const daysDifference = targetDate.diff(currentBaseDate, "day");
      const adjustedStartPosition = startPosition - 1;
      const rotationCycleLength = this.scheduleData.rotationCycleLength;

      const shiftIndex =
        (((adjustedStartPosition + daysDifference) % rotationCycleLength) +
          rotationCycleLength) %
        rotationCycleLength;

      return shiftIndex;
    },

    getScheduleForDate(
      targetDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    ) {
      return this._getScheduleForDate(
        targetDate,
        startPosition,
        currentBaseDate,
        lastBaseDate,
      );
    },

    _getScheduleForDate(
      targetDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    ) {
      const dateStr = targetDate.format("YYYY-MM-DD");
      const isHolidayFlag = this.isHoliday(targetDate);
      const isSaturday = targetDate.day() === 6; // day()は0が日曜、6が土曜
      const formattedCurrentBaseDate = currentBaseDate.format("YYYY-MM-DD");
      const formattedLastBaseDate = lastBaseDate.format("YYYY-MM-DD");

      // 日付が基準範囲外の場合
      if (
        (currentBaseDate.unix() !== lastBaseDate.unix() &&
          dateStr >= formattedLastBaseDate) ||
        dateStr < formattedCurrentBaseDate
      ) {
        return {
          dateStr,
          subject: "-",
          startTime: "",
          endTime: "",
          isHoliday: isHolidayFlag,
          isSaturday,
        };
      }

      // 日付差分から勤務位置を計算
      const shiftIndex = this.calculateShiftIndex(
        targetDate,
        startPosition,
        currentBaseDate,
      );

      // 曜日タイプに基づくデータ選択
      let shiftData;
      if (isHolidayFlag) {
        shiftData = this.scheduleData.holiday[shiftIndex];
      } else if (isSaturday) {
        shiftData = this.scheduleData.saturday[shiftIndex];
      } else {
        shiftData = this.scheduleData.weekday[shiftIndex];
      }

      if (!shiftData) return null;

      const [subject, startTime, endTime] = shiftData.split(",");
      return {
        dateStr,
        subject,
        startTime,
        endTime,
        isHoliday: isHolidayFlag,
        isSaturday,
        shiftIndex, // シフトインデックスを結果に含める
      };
    },

    calculateScheduleRange(
      startDate,
      endDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    ) {
      const scheduleRange = [];

      let currentDate = dayjs(startDate);
      const finalEndDate = dayjs(endDate);

      while (currentDate.isBefore(finalEndDate)) {
        const scheduleInfo = this.getScheduleForDate(
          currentDate,
          startPosition,
          currentBaseDate,
          lastBaseDate,
        );

        if (scheduleInfo) {
          scheduleRange.push({
            date: currentDate,
            ...scheduleInfo,
          });
        }

        currentDate = currentDate.add(1, "day");
      }

      return scheduleRange;
    },
  });
}
