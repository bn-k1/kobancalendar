import { defineStore } from "pinia";
import { ref, computed } from "vue";
import dayjs from "dayjs";
import { useScheduleStore } from "./schedule";
import { useHolidayStore } from "./holiday";
import { CALENDAR_CONFIG, APP_CONFIG } from "@/config/constants";

export const useCalendarStore = defineStore("calendar", () => {
  // 状態
  const calendarConfig = ref({
    ...CALENDAR_CONFIG,
  });
  const startPosition = ref(APP_CONFIG.DEFAULT_START_POSITION);
  const exportMonths = ref(APP_CONFIG.DEFAULT_EXPORT_MONTHS);
  const calendarEvents = ref([]);
  const icsExportConfig = ref({});
  const eventConfig = ref(null);

  // ゲッター
  const isConfigLoaded = computed(() => {
    return eventConfig.value !== null;
  });

  // アクション
  function setStartPosition(position) {
    startPosition.value = position;
  }

  function setExportMonths(months) {
    exportMonths.value = months;
  }

  function setCalendarEvents(events) {
    calendarEvents.value = events;
  }

  function setICSExportConfig(config) {
    icsExportConfig.value = config;
  }

  function setEventConfig(config) {
    eventConfig.value = config;
  }

  // イベントタイプを取得
  function getEventType(subject) {
    if (!eventConfig.value || !eventConfig.value.events) {
      console.error("イベント設定が読み込まれていないか無効です");
      return {
        type: "default",
        config: eventConfig.value?.events?.default || {},
      };
    }

    // events オブジェクト内のすべてのイベントタイプを確認
    for (const [type, config] of Object.entries(eventConfig.value.events)) {
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
      config: eventConfig.value.events.default,
    };
  }

  // 飲み会に参加可能かどうかを判定
  function canAttendMeetup(schedule, meetupStartTime) {
    if (!schedule) return false;

    const { subject, endTime } = schedule;

    // 公休、法休などの休日タイプを設定から取得
    if (eventConfig.value && eventConfig.value.events) {
      const restDayConfig = eventConfig.value.events.restDay;

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

    // 勤務終了時間が飲み会開始時間より前なら参加可能
    return endTimeObj.isBefore(meetupTimeObj);
  }

  // カレンダーのイベントを生成
  function generateCalendarEvents(startDate, endDate) {
    const scheduleStore = useScheduleStore();
    const holidayStore = useHolidayStore();
    const generatedEvents = [];

    let currentDate = dayjs(startDate);
    while (currentDate.isBefore(endDate)) {
      const scheduleInfo = scheduleStore.getScheduleForDate(
        currentDate,
        startPosition.value,
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

      const { config } = getEventType(subject);
      generatedEvents.push({
        title: config.showTime
          ? `${subject}\n${startTime} - \n${endTime}`
          : subject,
        start: dateStr,
        color: config.color,
        extendedProps: {
          startTime,
          endTime,
          isShift: true,
          isHoliday,
          isSaturday,
          shiftIndex,
          holidayName: holidayStore.getHolidayName(currentDate),
        },
      });
      currentDate = currentDate.add(1, "day");
    }

    setCalendarEvents(generatedEvents);
    return generatedEvents;
  }

  return {
    // 状態
    calendarConfig,
    startPosition,
    exportMonths,
    calendarEvents,
    icsExportConfig,
    eventConfig,

    // ゲッター
    isConfigLoaded,

    // アクション
    setStartPosition,
    setExportMonths,
    setCalendarEvents,
    setICSExportConfig,
    setEventConfig,

    // 関数
    getEventType,
    canAttendMeetup,
    generateCalendarEvents,
  };
});
