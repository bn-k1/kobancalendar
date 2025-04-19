<template>
  <div id="meetup-view">
    <div class="controls">
      <fieldset id="baseDateSection" class="control-group" v-if="isLoaded">
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
              :key="date.format(DATE_FORMATS.ISO_DATE)"
              :value="date.format(DATE_FORMATS.ISO_DATE)"
            >
              {{ date.format(DATE_FORMATS.ISO_DATE) }}
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
            @change="handleMeetupStartTimeChange"
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
            @change="handleSearchPeriodChange"
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

    <ResultsDisplay :results="results" :showResults="showResults" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import ParticipantsList from "@/components/ParticipantsList.vue";
import ResultsDisplay from "@/components/ResultsDisplay.vue";
import { useScheduleStore } from "@/stores/schedule";
import { useCalendarStore } from "@/stores/calendar";
import { findMeetupDates } from "@/services/availability-service";
import { APP_CONFIG, ERROR_MESSAGES, DATE_FORMATS } from "@/config/constants";
import {
  initializeApplication,
  setCurrentBaseDate,
} from "@/services/application-service";
import {
  updateURLParams,
  getURLParam,
  getNumberParam,
} from "@/utils/params-utils";

// CSVデータのインポート
import holidayData from "@/data/holiday.csv?raw";
import saturdayData from "@/data/saturday.csv?raw";
import weekdayData from "@/data/weekday.csv?raw";
import eventConfig from "@/config/event.json";
import config from "@/config/config.json";

// ローカル状態
const isLoaded = ref(false);
const selectedBaseDate = ref("");
const meetupStartTime = ref(APP_CONFIG.DEFAULT_MEETUP_START_TIME);
const searchPeriod = ref(APP_CONFIG.DEFAULT_SEARCH_PERIOD);
const participants = ref([{ position: "" }]);
const results = ref({ allMatches: [], partialMatches: [] });
const showResults = ref(false);

// ストア
const scheduleStore = useScheduleStore();
const { baseDates } = storeToRefs(scheduleStore);
const calendarStore = useCalendarStore();

// ローカルコンピューテッド
const rotationCycleLength = computed(() => {
  return scheduleStore.scheduleData.rotationCycleLength;
});

// 基準日変更処理
function handleBaseDateChange() {
  const newBaseDate = dayjs(selectedBaseDate.value);
  scheduleStore.updateCurrentBaseDate(newBaseDate);

  // URLを更新
  updateAllURLParams();
}

// 飲み会開始時間変更処理
function handleMeetupStartTimeChange() {
  // URLを更新
  updateAllURLParams();
}

// 検索期間変更処理
function handleSearchPeriodChange() {
  // URLを更新
  updateAllURLParams();
}

// 参加者更新処理
function updateParticipants(newParticipants) {
  participants.value = newParticipants;
  // ParticipantsListコンポーネント内で既にURLは更新されている
}

// 全てのパラメータをURLに反映する関数
function updateAllURLParams() {
  // 有効な参加者（positionが設定されている）のみを抽出
  const validParticipants = participants.value
    .filter((p) => p.position)
    .map((p) => p.position)
    .join(",");

  updateURLParams({
    baseDate: selectedBaseDate.value,
    meetupStartTime: meetupStartTime.value,
    searchPeriod: searchPeriod.value,
    participants: validParticipants,
  });
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
  const today = dayjs().startOf("day");
  const startDate = baseDate.isAfter(today) ? baseDate : today;
  const endDate = startDate.add(parseInt(searchPeriod.value), "day");

  // 検索実行
  results.value = findMeetupDates(
    positions,
    meetupStartTime.value,
    startDate,
    endDate,
  );
  showResults.value = true;
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
    // URLからパラメータを取得
    const baseDateParam = getURLParam("baseDate", "");
    const meetupStartTimeParam = getURLParam(
      "meetupStartTime",
      APP_CONFIG.DEFAULT_MEETUP_START_TIME,
    );
    const searchPeriodParam = getURLParam(
      "searchPeriod",
      APP_CONFIG.DEFAULT_SEARCH_PERIOD.toString(),
    );
    const participantsParam = getURLParam("participants", "");

    // パラメータを適用
    if (baseDateParam) {
      const dateObj = dayjs(baseDateParam);
      if (dateObj.isValid()) {
        // 有効な基準日があればそれを使用
        setCurrentBaseDate(dateObj, result.data.baseDates);
        selectedBaseDate.value = dateObj.format(DATE_FORMATS.ISO_DATE);
      } else {
        // デフォルトの基準日を設定
        const defaultBaseDate = result.data.baseDates[0];
        setCurrentBaseDate(defaultBaseDate, result.data.baseDates);
        selectedBaseDate.value = defaultBaseDate.format(DATE_FORMATS.ISO_DATE);
      }
    } else {
      // デフォルトの基準日を設定
      const defaultBaseDate = result.data.baseDates[0];
      setCurrentBaseDate(defaultBaseDate, result.data.baseDates);
      selectedBaseDate.value = defaultBaseDate.format(DATE_FORMATS.ISO_DATE);
    }

    // 飲み会開始時間と検索期間を設定
    meetupStartTime.value = meetupStartTimeParam;
    searchPeriod.value = searchPeriodParam;

    // URLから参加者情報を取得して設定
    if (participantsParam) {
      const positionList = participantsParam
        .split(",")
        .map((p) => parseInt(p))
        .filter((p) => !isNaN(p));
      if (positionList.length > 0) {
        participants.value = positionList.map((position) => ({ position }));
      }
    }

    isLoaded.value = true;
  }
});
</script>
