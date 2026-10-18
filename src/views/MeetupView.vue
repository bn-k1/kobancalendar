<template>
  <UnifiedPageLayout
    layout="meetup"
    :show-results="showResults"
    @title-click="switchToDefaultBaseDate"
  >
    <!-- Search controls section -->
    <template #search-controls>
      <div class="search-controls">
        <!-- Base date selector -->
        <BaseSelector
          v-if="isLoaded"
          id="baseDate"
          v-model="selectedBaseDate"
          legend="基準日"
          aria-label="基準日を選択"
          :display-as-text="true"
          :display-value="
            activeBaseDate ? formatAsDisplayDate(activeBaseDate) : ''
          "
          :options="[]"
        >
          <div
            v-if="nextBaseDateStr && selectedBaseDate !== nextBaseDateStr"
            class="version-link-row"
          >
            <button class="version-btn" @click="switchToNextBaseDate">
              新版: {{ formatAsDisplayDate(nextBaseDate) }}~
            </button>
          </div>
          <div
            v-else-if="nextBaseDateStr && defaultBaseDate"
            class="version-link-row"
          >
            <button class="version-btn" @click="switchToDefaultBaseDate">
              旧版: {{ formatAsDisplayDate(defaultBaseDate) }}~
            </button>
          </div>
        </BaseSelector>

        <!-- Meetup settings -->
        <fieldset
          v-if="isLoaded"
          id="meetupSettingsSection"
          class="control-group"
        >
          <legend>検索条件</legend>
          <div class="form-group">
            <label for="meetupStartTime">飲会開始:</label>
            <select
              id="meetupStartTime"
              v-model="meetupStartTime"
              aria-label="飲み会開始時間"
            >
              <option v-for="time in TIME_OPTIONS" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="searchPeriod">検索期間:</label>
            <select
              id="searchPeriod"
              v-model="searchPeriod"
              aria-label="検索期間"
            >
              <option
                v-for="period in PERIOD_OPTIONS"
                :key="period.value"
                :value="period.value"
              >
                {{ period.text }}
              </option>
            </select>
          </div>
        </fieldset>
      </div>
    </template>

    <!-- Participants section -->
    <template #participants>
      <Suspense v-if="isLoaded">
        <ParticipantsList
          v-model="participants"
          :rotation-cycle-length="rotationCycleLength"
        />
        <template #fallback>
          <div class="loading-placeholder">Loading...</div>
        </template>
      </Suspense>
    </template>

    <!-- Search button section -->
    <template #search-button>
      <button
        v-if="isLoaded"
        id="findDatesBtn"
        class="primary-btn action-btn"
        @click="findDates"
      >
        日程を検索
      </button>
    </template>

    <!-- Results section -->
    <template #results>
      <Suspense v-if="showResults">
        <ResultsDisplay
          :results="searchResults"
          :cutoff-date="searchCutoff"
        />
        <template #fallback>
          <div class="loading-placeholder">Loading...</div>
        </template>
      </Suspense>
    </template>
  </UnifiedPageLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from "vue";

// Essential components loaded immediately
import UnifiedPageLayout from "@/layouts/UnifiedPageLayout.vue";
import BaseSelector from "@/components/Controls/BaseSelector.vue";

// Lazy load larger or less critical components
const ParticipantsList = defineAsyncComponent(
  () => import("@/components/Controls/ParticipantsList.vue"),
);
const ResultsDisplay = defineAsyncComponent(
  () => import("@/components/ResultsDisplay.vue"),
);

// Composables
import { useSchedule } from "@/composables/useSchedule";
import { useAppInitializer } from "@/composables/useAppInitializer";
import { useLocalParams } from "@/composables/useLocalParams";
import { useUrlParams } from "@/composables/useUrlParams";
import { useMeetupSearch } from "@/composables/useMeetupSearch";

// Utils
import {
  createDate,
  formatAsISODate,
  formatAsDisplayDate,
  today,
  isAfter,
  isSameDay,
  addDays,
} from "@/utils/date";

// Import consolidated JSON data
import scheduleData from "@data/scheduleData.json";
import eventConfig from "@config/event.json";
import config from "@config/config.json";

const DEFAULT_START_TIME = "17:00";
const DEFAULT_SEARCH_PERIOD = "30";
const TIME_OPTIONS = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];
const PERIOD_OPTIONS = [
  { value: "30", text: "1ヶ月" },
  { value: "60", text: "2ヶ月" },
  { value: "90", text: "3ヶ月" },
];
const INIT_FAILED = "アプリケーションの初期化に失敗しました";

// Local state
const showResults = ref(false);
// Exclusive end the last search was cut to (next generation's from), if any.
const searchCutoff = ref(null);
const selectedBaseDate = ref("");
const meetupStartTime = ref(DEFAULT_START_TIME);
const searchPeriod = ref(DEFAULT_SEARCH_PERIOD);
const participants = ref([{ position: "", name: "" }]);

// Composables initialization
const { isLoaded, initializeApp } = useAppInitializer();
const {
  saveMeetupParams,
  loadMeetupActive,
  setMeetupActive,
  loadMeetupParamsFor,
  clearMeetupParams,
  loadCalendarSelection,
  loadCalendarPositionFor,
} = useLocalParams();
const { clearMeetupUrl } = useUrlParams();
const { searchResults, findMeetupDates } = useMeetupSearch();

// Schedule composable
const {
  defaultBaseDate,
  activeBaseDate,
  nextBaseDate,
  rotationCycleLength,
  updateActiveBaseDate,
  epochEndFor,
} = useSchedule();

const nextBaseDateStr = computed(() => {
  if (!nextBaseDate.value?.isValid?.()) return null;
  if (!defaultBaseDate.value?.isValid?.()) return null;
  if (
    formatAsISODate(nextBaseDate.value) ===
    formatAsISODate(defaultBaseDate.value)
  )
    return null;
  return formatAsISODate(nextBaseDate.value);
});

function validParticipants(items) {
  return items.filter((p) => !isNaN(parseInt(p.position, 10)));
}

function applySelectedBaseDate(dateObj) {
  updateActiveBaseDate(dateObj);
  selectedBaseDate.value = formatAsISODate(dateObj);
}

function applyHomeFallbackFor(baseDateStr) {
  const homePosition = loadCalendarPositionFor(baseDateStr);
  if (!Number.isInteger(homePosition)) return false;

  participants.value = [{ position: homePosition }];
  meetupStartTime.value = DEFAULT_START_TIME;
  searchPeriod.value = DEFAULT_SEARCH_PERIOD;
  saveMeetupParams(
    baseDateStr,
    participants.value,
    meetupStartTime.value,
    searchPeriod.value,
  );
  return true;
}

function resetMeetupToDefaults() {
  participants.value = [{ position: "", name: "" }];
  meetupStartTime.value = DEFAULT_START_TIME;
  searchPeriod.value = DEFAULT_SEARCH_PERIOD;
}

function applyMeetupSet(baseDateStr) {
  const loaded = loadMeetupParamsFor(baseDateStr);
  if (loaded) {
    participants.value = loaded.participants;
    meetupStartTime.value = loaded.startTime;
    searchPeriod.value = String(loaded.period);
    return;
  }
  if (applyHomeFallbackFor(baseDateStr)) return;
  resetMeetupToDefaults();
}

function switchToNextBaseDate() {
  const nextDateObj = createDate(nextBaseDateStr.value);
  applySelectedBaseDate(nextDateObj);
  showResults.value = false;
  setMeetupActive(nextBaseDateStr.value);
  applyMeetupSet(nextBaseDateStr.value);
}

function switchToDefaultBaseDate() {
  if (!defaultBaseDate.value) return;
  const dateStr = formatAsISODate(defaultBaseDate.value);
  applySelectedBaseDate(defaultBaseDate.value);
  showResults.value = false;
  setMeetupActive(dateStr);
  applyMeetupSet(dateStr);
}

function classifyBaseDate(baseDateStr, validBaseDates) {
  if (!baseDateStr) return { kind: "empty" };
  const dateObj = createDate(baseDateStr);
  if (!dateObj.isValid()) return { kind: "invalid" };
  if (validBaseDates.some((d) => d && isSameDay(d, dateObj))) {
    return { kind: "active", baseDate: dateObj };
  }
  return { kind: "unknown" };
}

// Find available dates
function findDates() {
  // Get valid participant positions
  const valid = validParticipants(participants.value);
  const positions = valid.map((p) => parseInt(p.position, 10));
  const names = valid.map((p) => (p.name ?? "").trim());

  // Validate
  if (positions.length === 0) {
    alert("参加者を1人以上選択してください");
    return;
  }

  // Confirm if only one participant
  if (positions.length === 1) {
    alert("行ってらっしゃいませ");
    return;
  }

  // Set up date range
  const baseDate = createDate(selectedBaseDate.value);
  const currentDay = today();
  const startDate = isAfter(baseDate, currentDay) ? baseDate : currentDay;
  let endDate = addDays(startDate, parseInt(searchPeriod.value, 10));
  // この世代の交番表は次の世代の from までしか使えない。その先は日程が
  // 出せず黙って結果から消えるので、期間を切り詰めて画面で知らせる。
  const epochEnd = epochEndFor(baseDate);
  searchCutoff.value = null;
  if (epochEnd && isAfter(endDate, epochEnd)) {
    endDate = epochEnd;
    searchCutoff.value = epochEnd;
  }

  // Search for available dates
  findMeetupDates(positions, meetupStartTime.value, startDate, endDate, names);

  // Show results
  showResults.value = true;

  // Persist the search config so it's restored next visit
  saveMeetupParams(
    selectedBaseDate.value,
    participants.value,
    meetupStartTime.value,
    searchPeriod.value,
  );
}

async function initialize() {
  try {
    const result = await initializeApp({
      scheduleData,
      config,
      eventConfig,
    });

    if (!result) {
      alert(INIT_FAILED);
      return false;
    }

    const validBaseDates = [defaultBaseDate.value, nextBaseDate.value].filter(
      Boolean,
    );

    // Meetup state is storage-only; drop b/ps/t/d left by old shared URLs.
    clearMeetupUrl();
    if (applyFromStorage(validBaseDates)) return true;
    if (applyFromHomeStorage(validBaseDates)) return true;
    applySelectedBaseDate(defaultBaseDate.value);
    return true;
  } catch {
    alert(INIT_FAILED);
    return false;
  }
}

function applyFromStorage(validBaseDates) {
  const active = loadMeetupActive();
  const cls = classifyBaseDate(active, validBaseDates);
  if (cls.kind !== "active") {
    if (active) clearMeetupParams();
    return false;
  }
  applySelectedBaseDate(cls.baseDate);
  applyMeetupSet(active);
  return true;
}

function applyFromHomeStorage(validBaseDates) {
  const home = loadCalendarSelection();
  if (!home || !Number.isInteger(home.startNumber)) return false;

  const cls = classifyBaseDate(home.baseDate, validBaseDates);
  if (cls.kind !== "active") return false;

  applySelectedBaseDate(cls.baseDate);
  return applyHomeFallbackFor(formatAsISODate(cls.baseDate));
}

// Watch for base date changes from composable
watch(activeBaseDate, (newBaseDate) => {
  if (newBaseDate) {
    selectedBaseDate.value = formatAsISODate(newBaseDate);
  }
});

onMounted(async () => {
  await initialize();
});
</script>

<style scoped>
.search-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

@media screen and (min-width: 768px) {
  .search-controls {
    flex-direction: row;
  }
  .search-controls > * {
    flex: 1;
  }
}
</style>
