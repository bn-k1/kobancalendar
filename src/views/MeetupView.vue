<template>
  <div id="meetup-view">
    <div class="controls">
      <fieldset
        id="baseDateSection"
        class="control-group"
        v-if="isLoaded"
      >
        <legend>基準日</legend>
        <div class="form-group">
          <select
            id="baseDate"
            aria-label="基準日を選択"
            v-model="selectedBaseDate"
            @change="handleBaseDateChange"
          >
            <option
              v-for="date in baseDates"
              :key="date.format('YYYY-MM-DD')"
              :value="date.format('YYYY-MM-DD')"
            >
              {{ date.format('YYYY-MM-DD') }}
            </option>
          </select>
        </div>
      </fieldset>

      <fieldset
        id="meetupSettingsSection"
        class="control-group"
        v-if="isLoaded"
      >
        <legend>検索条件</legend>
        <div class="form-group">
          <label for="meetupStartTime">飲会開始:</label>
          <select
            id="meetupStartTime"
            aria-label="飲み会開始時間"
            v-model="meetupStartTime"
          >
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
            <option value="18:00">18:00</option>
            <option value="19:00">19:00</option>
            <option value="20:00">20:00</option>
            <option value="21:00">21:00</option>
          </select>
        </div>
        <div class="form-group">
          <label for="searchPeriod">検索期間:</label>
          <select
            id="searchPeriod"
            aria-label="検索期間"
            v-model="searchPeriod"
          >
            <option value="30">1ヶ月</option>
            <option value="60">2ヶ月</option>
            <option value="90">3ヶ月</option>
            <option value="120">4ヶ月</option>
            <option value="150">5ヶ月</option>
            <option value="180">6ヶ月</option>
          </select>
        </div>
      </fieldset>

      <ParticipantsList
        :isLoaded="isLoaded"
        :rotationCycleLength="rotationCycleLength"
        @update:participants="updateParticipants"
      />

      <button
        id="findDatesBtn"
        class="primary-btn action-btn"
        v-if="isLoaded"
        @click="findDates"
      >
        日程を検索
      </button>
    </div>

    <ResultsDisplay
      :results="results"
      :showResults="showResults"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import ParticipantsList from '@/components/ParticipantsList.vue';
import ResultsDisplay from '@/components/ResultsDisplay.vue';
// MeetupViewではCalendarViewは使用しないため、インポートを削除します
import { useScheduleStore } from '@/stores/schedule';
import { useHolidayStore } from '@/stores/holiday';
import { useCalendarStore } from '@/stores/calendar';
import { findMeetupDates, checkDateForPositions } from '@/services/availability-service';
import { APP_CONFIG, ERROR_MESSAGES } from '@/config/constants';

// CSVデータのインポート
import holidayData from '@/data/holiday.csv?raw';
import saturdayData from '@/data/saturday.csv?raw';
import weekdayData from '@/data/weekday.csv?raw';
import eventConfig from '@/config/event.json';
import config from '@/config/config.json';

// ローカル状態
const isLoaded = ref(false);
const selectedBaseDate = ref('');
const meetupStartTime = ref(APP_CONFIG.DEFAULT_MEETUP_START_TIME);
const searchPeriod = ref(APP_CONFIG.DEFAULT_SEARCH_PERIOD);
const participants = ref([{ position: '' }]);
const results = ref({ allMatches: [], partialMatches: [] });
const showResults = ref(false);

// ストア
const scheduleStore = useScheduleStore();
const { baseDates } = storeToRefs(scheduleStore);
const holidayStore = useHolidayStore();
const calendarStore = useCalendarStore();

// ローカルコンピューテッド
const rotationCycleLength = computed(() => {
  return scheduleStore.scheduleData.rotationCycleLength;
});

// 基準日変更処理
function handleBaseDateChange() {
  const newBaseDate = dayjs(selectedBaseDate.value);
  scheduleStore.updateCurrentBaseDate(newBaseDate);
}

// 参加者更新処理
function updateParticipants(newParticipants) {
  participants.value = newParticipants;
}

// 日程検索
function findDates() {
  // 有効な参加者のポジションを取得
  const positions = participants.value
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
  const baseDate = dayjs(selectedBaseDate.value);
  const today = dayjs().startOf('day');
  const startDate = baseDate.isAfter(today) ? baseDate : today;
  const endDate = startDate.add(parseInt(searchPeriod.value), 'day');
  
  // 検索実行
  results.value = findMeetupDates(
    positions,
    meetupStartTime.value,
    startDate,
    endDate
  );
  showResults.value = true;
}

// アプリケーションの初期化
async function initApplication() {
  try {
    // イベント設定
    calendarStore.setEventConfig(eventConfig);
    
    // 祝日設定
    holidayStore.setHolidayYearsRange(config.holiday_years_range || 5);
    holidayStore.setUserDefinedHolidays(config.custom_holidays || []);
    
    // スケジュールデータの読み込み
    scheduleStore.loadScheduleData(
      holidayData,
      saturdayData,
      weekdayData
    );
    
    // 基準日の設定 (スケジュールデータロード後に行う)
    const configBaseDates = config.base_dates.map(dateStr => dayjs(dateStr))
      .sort((a, b) => a.unix() - b.unix());
    scheduleStore.setBaseDates(configBaseDates);
    
    const defaultBaseDate = configBaseDates[0];
    scheduleStore.setLastBaseDate(configBaseDates[configBaseDates.length - 1]);
    // currentBaseDate設定はプロセスの最後に行う
    scheduleStore.updateCurrentBaseDate(defaultBaseDate);
    selectedBaseDate.value = defaultBaseDate.format('YYYY-MM-DD');
    
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