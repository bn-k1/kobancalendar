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
import { ref } from "vue";
import {
  formatAsISODate,
  formatAsDisplayDate,
  getWeekdayName,
} from "@/utils/date";
import { useHolidays } from "@/composables/useHolidays";
import { useSchedule } from "@/composables/useSchedule";

// Props
const props = defineProps({
  results: {
    type: Object,
    required: true,
    default: () => ({ allMatches: [], partialMatches: [] }),
  },
});

// Composables
const { isHoliday } = useHolidays();
const { getScheduleForDate } = useSchedule();

// Local state
const activeTab = ref("all");
const showModal = ref(false);
const currentDetails = ref({ details: [] });
const modalTitle = ref("");

// Get day classes for styling
function getDayClass(date) {
  if (isHoliday(date)) {
    return "holiday";
  }

  const day = date.day();
  if (day === 0) return "fc-day-sun";
  if (day === 6) return "fc-day-sat";

  return "";
}

// Show details for a match
function showDetails(match) {
  currentDetails.value = match;
  modalTitle.value = `${formatAsDisplayDate(match.date)}（${getWeekdayName(match.date)}）詳細`;
  showModal.value = true;
}

// Close modal when clicking outside
function closeModalOnOutsideClick(event) {
  if (event.target.id === "detailsModal") {
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
    return "-";
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

  return "-";
}

// Get next day shift description
function getNextDayShift(detail) {
  if (
    !detail ||
    !detail.position ||
    !currentDetails.value ||
    !currentDetails.value.date
  ) {
    return "-";
  }

  // Next day schedule
  const nextDay = currentDetails.value.date.add(1, "day");
  const nextDaySchedule = getScheduleForDate(nextDay, detail.position);

  // Format and return shift description
  if (nextDaySchedule && nextDaySchedule.subject) {
    if (nextDaySchedule.startTime) {
      return `${nextDaySchedule.startTime}~(${nextDaySchedule.subject})`;
    }
    return nextDaySchedule.subject;
  }

  return "-";
}
</script>

<style scoped>
/* Results display specific styles */
.results {
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  width: 100%;
  overflow-x: auto;
}

.results h2 {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--primary-dark);
  font-weight: var(--font-weight-bold);
  font-size: 1.6rem;
}

.results-tabs {
  display: flex;
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.tab-btn {
  background: none;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  color: var(--gray-600);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
  box-shadow: none;
  font-size: 1.05rem;
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--primary-color);
  background: none;
  box-shadow: none;
  transform: none;
}

.tab-btn.active {
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: var(--font-weight-bold);
}

.tab-content {
  display: none;
  width: 100%;
}

.tab-content.active {
  display: block;
  animation: fadeIn var(--transition-normal);
}

.results-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.results-table th,
.results-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  border-bottom: 1px solid var(--gray-200);
  font-size: 1.02rem;
  white-space: nowrap;
}

.results-table th {
  background-color: var(--primary-light);
  color: var(--text-light);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.results-table tr:last-child td {
  border-bottom: none;
}

.results-table tr:nth-child(even) {
  background-color: var(--gray-100);
}

.results-table tr:hover {
  background-color: rgba(67, 97, 238, 0.1);
}

.results-table .view-details {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-pill);
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.results-table .view-details:hover {
  background-color: var(--primary-light);
  transform: translateY(-1px);
}

.no-results-message {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--gray-600);
  font-style: italic;
  background-color: var(--gray-100);
  border-radius: var(--border-radius-md);
  margin: var(--spacing-md) 0;
  font-size: 1.05rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  overflow-x: hidden;
}

.modal-content {
  background-color: var(--background-light);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  max-width: 90%;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  box-shadow: var(--shadow-xl);
  animation: slideIn 0.3s ease;
  border: 1px solid var(--gray-200);
}

.close-modal {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  font-size: 1.6rem;
  cursor: pointer;
  color: var(--gray-500);
  transition: color var(--transition-fast);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-modal:hover {
  color: var(--error-color);
  background-color: var(--gray-100);
}

.details-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.details-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.details-table th,
.details-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
  font-size: 1.02rem;
}

.details-table th {
  background-color: var(--primary-light);
  color: var(--text-light);
  font-weight: var(--font-weight-medium);
  text-align: left;
  white-space: nowrap;
}

.details-table tr:last-child td {
  border-bottom: none;
}

.availability-yes {
  color: var(--success-color);
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
}

.availability-yes::before {
  content: "✓";
  display: inline-block;
  font-size: 1.4em;
}

.availability-no {
  color: var(--error-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.availability-no::before {
  content: "✗";
  display: inline-block;
  font-size: 1.4em;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
