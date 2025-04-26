<!-- src/components/ResultsDisplay.vue -->
<template>
  <div id="results" class="results">
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
      <!-- All matches tab content -->
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
              :key="formatAsISODate(match.date)"
            >
              <td>{{ formatAsDisplayDate(match.date) }}</td>
              <td :class="getDayClass(match.date)">
                {{ getWeekdayName(match.date) }}
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

      <!-- Partial matches tab content -->
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
              :key="formatAsISODate(match.date)"
            >
              <td>{{ formatAsDisplayDate(match.date) }}</td>
              <td :class="getDayClass(match.date)">
                {{ getWeekdayName(match.date) }}
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

  <!-- Details modal -->
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
            ></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  formatAsISODate, 
  formatAsDisplayDate, 
  getWeekdayName 
} from '@/utils/date';
import { useHolidays } from '@/composables/useHolidays';
import { useSchedule } from '@/composables/useSchedule';

// Props
const props = defineProps({
  results: {
    type: Object,
    required: true,
    default: () => ({ allMatches: [], partialMatches: [] }),
  }
});

// Composables
const { isHoliday } = useHolidays();
const { getScheduleForDate } = useSchedule();

// Local state
const activeTab = ref('all');
const showModal = ref(false);
const currentDetails = ref({ details: [] });
const modalTitle = ref('');

// Get day classes for styling
function getDayClass(date) {
  if (isHoliday(date)) {
    return 'holiday';
  }
  
  const day = date.day();
  if (day === 0) return 'fc-day-sun';
  if (day === 6) return 'fc-day-sat';
  
  return '';
}

// Show details for a match
function showDetails(match) {
  currentDetails.value = match;
  modalTitle.value = `${formatAsDisplayDate(match.date)}（${getWeekdayName(match.date)}）詳細`;
  showModal.value = true;
}

// Close modal when clicking outside
function closeModalOnOutsideClick(event) {
  if (event.target.id === 'detailsModal') {
    showModal.value = false;
  }
}

// Get current day shift description
function getCurrentDayShift(detail) {
  if (
    !detail ||
    !detail.position ||
    !currentDetails.value ||
    !currentDetails.value.date
  ) {
    return '-';
  }

  // Current day schedule
  const currentDaySchedule = detail.schedule;

  // Format and return shift description
  if (currentDaySchedule && currentDaySchedule.subject) {
    if (currentDaySchedule.endTime) {
      return `~${currentDaySchedule.endTime}(${currentDaySchedule.subject})`;
    }
    return currentDaySchedule.subject;
  }

  return '-';
}

// Get next day shift description
function getNextDayShift(detail) {
  if (
    !detail ||
    !detail.position ||
    !currentDetails.value ||
    !currentDetails.value.date
  ) {
    return '-';
  }

  // Next day schedule
  const nextDay = currentDetails.value.date.add(1, 'day');
  const nextDaySchedule = getScheduleForDate(
    nextDay,
    detail.position
  );

  // Format and return shift description
  if (nextDaySchedule && nextDaySchedule.subject) {
    if (nextDaySchedule.startTime) {
      return `${nextDaySchedule.startTime}~(${nextDaySchedule.subject})`;
    }
    return nextDaySchedule.subject;
  }

  return '-';
}
</script>

<style scoped>
/* Reuse global styles from original app */
</style>
