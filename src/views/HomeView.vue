<template>
  <div id="home-view">
    <ControlPanel 
      :isLoaded="isLoaded" 
      @change="handleControlChange"
    />
    
    <CalendarView 
      ref="calendarRef"
      :initialDate="initialDate"
      @datesSet="handleDatesSet"
    />
    
    <ExportSection :isLoaded="isLoaded" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import CalendarView from '@/components/CalendarView.vue';
import ControlPanel from '@/components/ControlPanel.vue';
import ExportSection from '@/components/ExportSection.vue';
import { useScheduleStore } from '@/stores/schedule';
import { useHolidayStore } from '@/stores/holiday';
import { useCalendarStore } from '@/stores/calendar';
import { getDateParam, getNumberParam } from '@/utils/params-utils';
import { APP_CONFIG } from '@/config/constants';

// CSVデータのインポート
import holidayData from '@/data/holiday.csv?raw';
import saturdayData from '@/data/saturday.csv?raw';
import weekdayData from '@/data/weekday.csv?raw';
import eventConfig from '@/config/event.json';
import config from '@/config/config.json';

// ローカル状態
const isLoaded = ref(false);
const calendarRef = ref(null);

// ストア
const scheduleStore = useScheduleStore();
const { currentBaseDate, baseDates } = storeToRefs(scheduleStore);
const holidayStore = useHolidayStore();
const calendarStore = useCalendarStore();

// 初期日付
const initialDate = computed(() => {
  if (!currentBaseDate.value) return null;
  
  const today = dayjs().startOf('day');
  return currentBaseDate.value.isSameOrAfter(today) ? currentBaseDate.value.toDate() : today.toDate();
});

// コントロール変更ハンドラ
function handleControlChange(change) {
  if (change.type === 'baseDate') {
    // 基準日変更時の処理
    const today = dayjs().startOf('day');
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

// アプリケーションの初期化
async function initApplication() {
  try {
    // 設定の読み込み
    
    // 基準日の設定
    const configBaseDates = config.base_dates.map(dateStr => dayjs(dateStr))
      .sort((a, b) => a.unix() - b.unix());
    scheduleStore.setBaseDates(configBaseDates);
    
    // URLクエリパラメータから基準日を取得
    const defaultBaseDate = configBaseDates[0];
    const currentDate = getDateParam('baseDate', defaultBaseDate, configBaseDates);
    scheduleStore.updateCurrentBaseDate(currentDate);
    scheduleStore.setLastBaseDate(configBaseDates[configBaseDates.length - 1]);
    
    // 祝日設定
    holidayStore.setHolidayYearsRange(config.holiday_years_range || 5);
    holidayStore.setUserDefinedHolidays(config.custom_holidays || []);
    
    // ICSエクスポート設定
    calendarStore.setICSExportConfig(config.info);
    
    // イベント設定
    calendarStore.setEventConfig(eventConfig);
    
    // スケジュールデータの読み込み
    const data = scheduleStore.loadScheduleData(
      holidayData,
      saturdayData,
      weekdayData
    );
    
    // URLクエリパラメータからコマ位置を取得
    const position = getNumberParam(
      'startNumber',
      APP_CONFIG.DEFAULT_START_POSITION,
      1,
      data.rotationCycleLength
    );
    calendarStore.setStartPosition(position);
    
    // 祝日データの読み込み
    holidayStore.loadHolidays();
    
    isLoaded.value = true;
  } catch (error) {
    console.error('アプリケーションの初期化に失敗しました', error);
    alert('アプリケーションの初期化に失敗しました: ' + error.message);
  }
}

// マウント時の処理
onMounted(() => {
  initApplication();
});
</script>

<style scoped>
/* ビュー固有のスタイル */
</style>