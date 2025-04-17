<template>
  <div class="calendar-container">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useScheduleStore } from '@/stores/schedule';
import { useHolidayStore } from '@/stores/holiday';
import { useCalendarStore } from '@/stores/calendar';
import { CALENDAR_CONFIG } from '@/config/constants';

// プロップス
const props = defineProps({
  initialDate: {
    type: [Date, Object],
    default: null
  }
});

// エミット
const emit = defineEmits(['datesSet']);

// ストア
const scheduleStore = useScheduleStore();
const { currentBaseDate, lastBaseDate } = storeToRefs(scheduleStore);
const holidayStore = useHolidayStore();
const calendarStore = useCalendarStore();
const { startPosition, calendarEvents } = storeToRefs(calendarStore);

// ローカル状態
const calendarRef = ref(null);
const viewStart = ref(null);
const viewEnd = ref(null);

// コンピューテッドプロパティ
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: CALENDAR_CONFIG.INITIAL_VIEW,
  initialDate: props.initialDate ? props.initialDate : undefined,
  locale: CALENDAR_CONFIG.LOCALE,
  events: calendarEvents.value,
  aspectRatio: CALENDAR_CONFIG.DEFAULT_ASPECT_RATIO,
  height: CALENDAR_CONFIG.HEIGHT,
  
  // 日付セルのクラス名をカスタマイズ
  dayCellClassNames: (arg) => {
    const date = dayjs(arg.date);
    const classNames = [];
    
    if (holidayStore.isHoliday(date)) {
      classNames.push('holiday');
    }
    if (date.day() === 6) {
      classNames.push('fc-day-sat');
    }
    if (date.day() === 0) {
      classNames.push('fc-day-sun');
    }
    if (date.isSame(dayjs().startOf('day'), 'day')) {
      classNames.push('today-highlight');
    }
    
    return classNames;
  },
  
  // イベントコンテンツをカスタマイズ
  eventContent: (arg) => {
    const { event } = arg;
    let [title, startTime = '', endTime = ''] = event.title.split('\n');
    const { shiftIndex } = event.extendedProps;
    const date = dayjs(event.start);
    
    const holidayName = holidayStore.getHolidayName(date);
    const metaInfo = holidayName
      ? `${shiftIndex + 1} ${holidayName}`
      : `${shiftIndex + 1}`;
    
    return {
      html: `
        <div class="event-title">${title}</div>
        ${startTime ? `<div class="event-time">${startTime}</div>` : ''}
        ${endTime ? `<div class="event-time">${endTime}</div>` : ''}
        <div class="event-meta">${metaInfo}</div>
      `
    };
  },
  
  // 日付範囲が変更されたときのイベント
  datesSet: (info) => {
    const newStart = dayjs(info.start);
    const newEnd = dayjs(info.end);
    
    // ビューの日付範囲が変更された場合のみ更新
    if (
      !viewStart.value ||
      !viewEnd.value ||
      !newStart.isSame(viewStart.value) ||
      !newEnd.isSame(viewEnd.value)
    ) {
      viewStart.value = newStart;
      viewEnd.value = newEnd;
      updateCalendarEvents();
      emit('datesSet', { start: newStart, end: newEnd });
    }
  }
}));

// カレンダーイベントの更新
function updateCalendarEvents() {
  if (!viewStart.value || !viewEnd.value) return;
  
  calendarStore.generateCalendarEvents(
    viewStart.value,
    viewEnd.value
  );
}

// 日付にジャンプ
function gotoDate(date) {
  if (calendarRef.value) {
    calendarRef.value.getApi().gotoDate(date.toDate());
  }
}

// 外部に公開するメソッド
defineExpose({
  gotoDate
});

// ウォッチャー
watch(startPosition, () => {
  updateCalendarEvents();
});

watch([currentBaseDate, lastBaseDate], () => {
  updateCalendarEvents();
});

// マウント時の処理
onMounted(() => {
  // データが読み込まれているか確認
  if (!scheduleStore.isDataLoaded) {
    console.warn('スケジュールデータがまだ読み込まれていません');
    return;
  }

  // nextTickを使って描画後に実行
  setTimeout(() => {
    // 初期日付範囲の取得とイベント生成
    if (calendarRef.value) {
      try {
        const api = calendarRef.value.getApi();
        viewStart.value = dayjs(api.view.activeStart);
        viewEnd.value = dayjs(api.view.activeEnd);
        updateCalendarEvents();
      } catch (error) {
        console.error('カレンダーAPI初期化エラー:', error);
      }
    }
  }, 0);
});
</script>

<style scoped>
/* コンポーネント固有のスタイル */
</style>