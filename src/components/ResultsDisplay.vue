<template>
  <div id="results" class="results" v-if="showResults">
    <h2>検索結果</h2>
    <div class="results-tabs">
      <button
        id="allMatchesTab"
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
        data-matches="all"
      >
        全員一致
      </button>
      <button
        id="partialMatchesTab"
        class="tab-btn"
        :class="{ active: activeTab === 'partial' }"
        @click="activeTab = 'partial'"
        data-matches="partial"
      >
        部分一致
      </button>
    </div>
    <div id="resultsContent">
      <div
        id="allMatchesContent"
        class="tab-content"
        :class="{ active: activeTab === 'all' }"
      >
        <div class="no-results-message" v-if="results.allMatches.length === 0">
          全員が参加可能な日付は見つかりませんでした。
        </div>
        <table
          id="allMatchesTable"
          class="results-table"
          v-if="results.allMatches.length > 0"
        >
          <thead>
            <tr>
              <th>日付</th>
              <th>曜日</th>
              <th>参加可能人数</th>
              <th>詳細</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="match in results.allMatches"
              :key="match.date.format(DATE_FORMATS.ISO_DATE)"
            >
              <td>{{ match.date.format(DATE_FORMATS.DISPLAY_DATE) }}</td>
              <td :class="getDayClass(match.date)">
                {{ getWeekday(match.date) }}
              </td>
              <td>{{ match.availableCount }}/{{ match.totalCount }}</td>
              <td>
                <button class="view-details" @click="showDetails(match)">
                  詳細
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        id="partialMatchesContent"
        class="tab-content"
        :class="{ active: activeTab === 'partial' }"
      >
        <div
          class="no-results-message"
          v-if="results.partialMatches.length === 0"
        >
          条件に合う日付は見つかりませんでした。
        </div>
        <table
          id="partialMatchesTable"
          class="results-table"
          v-if="results.partialMatches.length > 0"
        >
          <thead>
            <tr>
              <th>日付</th>
              <th>曜日</th>
              <th>参加可能人数</th>
              <th>詳細</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="match in results.partialMatches"
              :key="match.date.format(DATE_FORMATS.ISO_DATE)"
            >
              <td>{{ match.date.format(DATE_FORMATS.DISPLAY_DATE) }}</td>
              <td :class="getDayClass(match.date)">
                {{ getWeekday(match.date) }}
              </td>
              <td>{{ match.availableCount }}/{{ match.totalCount }}</td>
              <td>
                <button class="view-details" @click="showDetails(match)">
                  詳細
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- 詳細モーダル -->
  <div
    id="detailsModal"
    class="modal"
    :class="{ hidden: !showModal }"
    @click="closeModalOnOutsideClick"
    v-if="showModal"
  >
    <div class="modal-content">
      <span class="close-modal" @click="showModal = false">&times;</span>
      <h3 id="modalDate">{{ modalTitle }}</h3>
      <table id="detailsTable" class="details-table">
        <thead>
          <tr>
            <th>コマ位置</th>
            <th>当日</th>
            <th>翌日</th>
            <th>参加可否</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="detail in currentDetails.details" :key="detail.position">
            <td>{{ detail.position }}</td>
            <td>{{ getCurrentDayShift(detail) }}</td>
            <td>{{ getNextDayShift(detail) }}</td>
            <td
              :class="
                detail.isAvailable ? 'availability-yes' : 'availability-no'
              "
            >
              {{ detail.isAvailable ? "○" : "×" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { useScheduleStore } from "@/stores/schedule";
import { DATE_FORMATS } from "@/config/constants";
import {
  getWeekdayName,
  getDayClass as getClassForDay,
} from "@/utils/date-utils";

// プロップス
const props = defineProps({
  results: {
    type: Object,
    required: true,
    default: () => ({ allMatches: [], partialMatches: [] }),
  },
  showResults: {
    type: Boolean,
    default: false,
  },
});

// エミット
const emit = defineEmits(["close"]);

// ストア
const scheduleStore = useScheduleStore();

// ローカル状態
const activeTab = ref("all");
const showModal = ref(false);
const currentDetails = ref({ details: [] });
const modalTitle = ref("");

// 曜日名を取得
function getWeekday(date) {
  return getWeekdayName(date);
}

// 日付クラスを取得
function getDayClass(date) {
  return getClassForDay(date);
}

// 詳細を表示
function showDetails(match) {
  currentDetails.value = match;
  modalTitle.value = `${match.date.format(DATE_FORMATS.DISPLAY_DATE)}（${getWeekday(match.date)}）詳細`;
  showModal.value = true;
}

// モーダル外クリックで閉じる
function closeModalOnOutsideClick(event) {
  if (event.target.id === "detailsModal") {
    showModal.value = false;
  }
}

// 現在の日の勤務内容を取得
function getCurrentDayShift(detail) {
  if (
    !detail ||
    !detail.position ||
    !currentDetails.value ||
    !currentDetails.value.date
  ) {
    return "-";
  }

  // 現在の日付を取得
  const currentDay = currentDetails.value.date;

  // 現在の日のスケジュールを取得
  const currentDaySchedule = scheduleStore.getScheduleForDate(
    currentDay,
    detail.position,
  );

  // 現在の日の勤務内容を整形して返す
  if (currentDaySchedule && currentDaySchedule.subject) {
    // その他の勤務の場合は開始時間と終了時間を表示
    if (currentDaySchedule.endTime) {
      return `~${currentDaySchedule.endTime}(${currentDaySchedule.subject})`;
    }

    return currentDaySchedule.subject;
  }

  return "-";
}

// 翌日の勤務内容を取得
function getNextDayShift(detail) {
  if (
    !detail ||
    !detail.position ||
    !currentDetails.value ||
    !currentDetails.value.date
  ) {
    return "-";
  }

  // 翌日の日付を計算
  const nextDay = currentDetails.value.date.add(1, "day");

  // 翌日のスケジュールを取得
  const nextDaySchedule = scheduleStore.getScheduleForDate(
    nextDay,
    detail.position,
  );

  // 翌日の勤務内容を整形して返す
  if (nextDaySchedule && nextDaySchedule.subject) {
    // その他の勤務の場合は開始時間も表示
    if (nextDaySchedule.startTime) {
      return `${nextDaySchedule.startTime}~(${nextDaySchedule.subject})`;
    }

    return nextDaySchedule.subject;
  }

  return "-";
}
</script>
