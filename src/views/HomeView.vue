<template>
  <div id="home-view">
    <ControlPanel :isLoaded="isLoaded" @change="handleControlChange" />

    <CalendarView
      ref="calendarRef"
      :initialDate="initialDate"
      @datesSet="handleDatesSet"
    />

    <ExportSection :isLoaded="isLoaded" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import CalendarView from "@/components/CalendarView.vue";
import ControlPanel from "@/components/ControlPanel.vue";
import ExportSection from "@/components/ExportSection.vue";
import { useScheduleStore } from "@/stores/schedule";
import { useCalendarStore } from "@/stores/calendar";
import { getDateParam, getNumberParam } from "@/utils/params-utils";
import { APP_CONFIG } from "@/config/constants";
import {
  initializeApplication,
  setCurrentBaseDate,
} from "@/services/application-service";

// CSVデータのインポート
import holidayData from "@/data/holiday.csv?raw";
import saturdayData from "@/data/saturday.csv?raw";
import weekdayData from "@/data/weekday.csv?raw";
import eventConfig from "@/config/event.json";
import config from "@/config/config.json";

// ローカル状態
const isLoaded = ref(false);
const calendarRef = ref(null);

// ストア
const scheduleStore = useScheduleStore();
const { currentBaseDate, baseDates } = storeToRefs(scheduleStore);
const calendarStore = useCalendarStore();

// 初期日付
const initialDate = computed(() => {
  if (!currentBaseDate.value) return null;

  const today = dayjs().startOf("day");
  return currentBaseDate.value.isSameOrAfter(today)
    ? currentBaseDate.value.toDate()
    : today.toDate();
});

// コントロール変更ハンドラ
function handleControlChange(change) {
  if (change.type === "baseDate") {
    // 基準日変更時の処理
    const today = dayjs().startOf("day");
    if (change.value.isSameOrAfter(today)) {
      calendarRef.value?.gotoDate(change.value);
    } else {
      calendarRef.value?.gotoDate(today);
    }
  }
}

// カレンダー日付範囲変更ハンドラ
function handleDatesSet(range) {
  // 現状では特に何もしない
}

// マウント時の処理
onMounted(async () => {
  // 共通初期化処理を実行
  const result = await initializeApplication(
    config,
    eventConfig,
    holidayData,
    saturdayData,
    weekdayData,
  );

  if (result.success) {
    // URLクエリパラメータから基準日を取得
    const paramBaseDate = getDateParam("baseDate", null, result.data.baseDates);

    // 基準日を設定
    setCurrentBaseDate(paramBaseDate, result.data.baseDates);

    // URLクエリパラメータからコマ位置を取得
    const position = getNumberParam(
      "startNumber",
      APP_CONFIG.DEFAULT_START_POSITION,
      1,
      result.data.scheduleData.rotationCycleLength,
    );
    calendarStore.setStartPosition(position);

    isLoaded.value = true;
  }
});
</script>
