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
              <td>
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
              <td>
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
  <DetailsModal
    v-if="showModal"
    :show="showModal"
    :title="modalTitle"
    :details="currentDetails"
    @close="showModal = false"
  />
</template>

<script setup>
import { ref } from "vue";
import {
  formatAsISODate,
  formatAsDisplayDate,
  getWeekdayName,
} from "@/utils/date";
import DetailsModal from "@/components/DetailsModal.vue";

// Props
const props = defineProps({
  results: {
    type: Object,
    required: true,
    default: () => ({ allMatches: [], partialMatches: [] }),
  },
});

// Local state
const activeTab = ref("all");
const showModal = ref(false);
const currentDetails = ref({ details: [] });
const modalTitle = ref("");

// Show details for a match
function showDetails(match) {
  currentDetails.value = match;
  modalTitle.value = `${formatAsDisplayDate(match.date)}（${getWeekdayName(match.date)}）詳細`;
  showModal.value = true;
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
</style>
