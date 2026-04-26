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
          :schedule-update-notice="scheduleUpdateNotice"
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
              <option v-for="time in TIMEOPTIONS" :key="time" :value="time">
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
                v-for="period in PERIODOPTIONS"
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
        <ResultsDisplay :results="searchResults" />
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

// Config
import {
  APP_CONFIG,
  TIMEOPTIONS,
  PERIODOPTIONS,
  ERROR_MESSAGES,
} from "@/utils/constants";

// Import consolidated JSON data
import defaultScheduleData from "@data/default/default.json";
import nextScheduleData from "@data/next/next.json";
import eventConfig from "@config/event.json";
import config from "@config/config.json";

// Local state
const showResults = ref(false);
const selectedBaseDate = ref("");
const meetupStartTime = ref(APP_CONFIG.DEFAULT_MEETUP_START_TIME);
const searchPeriod = ref(APP_CONFIG.DEFAULT_SEARCH_PERIOD.toString());
const participants = ref([{ position: "" }]);

// Composables initialization
const { isLoaded, initializeApp } = useAppInitializer();
const {
  saveMeetupParams,
  loadMeetupParams,
  loadMeetupParamsFor,
  clearMeetupParams,
  loadCalendarSelection,
  loadCalendarPositionFor,
} = useLocalParams();
const { readCanonicalMeetup, writeMeetupUrl, clearMeetupUrl } = useUrlParams();
const { searchResults, findMeetupDates } = useMeetupSearch();

// Schedule composable
const {
  defaultBaseDate,
  activeBaseDate,
  nextBaseDate,
  rotationCycleLength,
  updateActiveBaseDate,
  scheduleUpdateNotice,
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

function toValidPositionNumbers(items) {
  return items.map((p) => parseInt(p.position, 10)).filter((p) => !isNaN(p));
}

function applySelectedBaseDate(dateObj) {
  updateActiveBaseDate(dateObj);
  selectedBaseDate.value = formatAsISODate(dateObj);
}

function syncMeetupUrl() {
  const positions = toValidPositionNumbers(participants.value);
  if (positions.length === 0 || !meetupStartTime.value || !searchPeriod.value) {
    clearMeetupUrl();
    return;
  }
  writeMeetupUrl({
    participants: positions,
    startTime: meetupStartTime.value,
    period: searchPeriod.value,
  });
}

function applyHomeFallbackFor(baseDateStr) {
  const homePosition = loadCalendarPositionFor(baseDateStr);
  if (!Number.isInteger(homePosition)) return false;

  participants.value = [{ position: homePosition }];
  meetupStartTime.value = APP_CONFIG.DEFAULT_MEETUP_START_TIME;
  searchPeriod.value = APP_CONFIG.DEFAULT_SEARCH_PERIOD.toString();
  saveMeetupParams(
    baseDateStr,
    participants.value,
    meetupStartTime.value,
    searchPeriod.value,
  );
  return true;
}

function resetMeetupToDefaults() {
  participants.value = [{ position: "" }];
  meetupStartTime.value = APP_CONFIG.DEFAULT_MEETUP_START_TIME;
  searchPeriod.value = APP_CONFIG.DEFAULT_SEARCH_PERIOD.toString();
}

function applyMeetupSet(baseDateStr) {
  const loaded = loadMeetupParamsFor(baseDateStr);
  if (loaded) {
    participants.value = loaded.participants;
    meetupStartTime.value = loaded.startTime;
    searchPeriod.value = String(loaded.period);
    syncMeetupUrl();
    return;
  }
  if (applyHomeFallbackFor(baseDateStr)) {
    syncMeetupUrl();
    return;
  }
  resetMeetupToDefaults();
  syncMeetupUrl();
}

function switchToNextBaseDate() {
  const nextDateObj = createDate(nextBaseDateStr.value);
  applySelectedBaseDate(nextDateObj);
  showResults.value = false;
  applyMeetupSet(nextBaseDateStr.value);
}

function switchToDefaultBaseDate() {
  if (!defaultBaseDate.value) return;
  const dateStr = formatAsISODate(defaultBaseDate.value);
  applySelectedBaseDate(defaultBaseDate.value);
  showResults.value = false;
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
  const positions = toValidPositionNumbers(participants.value);

  // Validate
  if (positions.length === 0) {
    alert(ERROR_MESSAGES.NO_PARTICIPANTS);
    return;
  }

  // Confirm if only one participant
  if (positions.length === 1) {
    alert(ERROR_MESSAGES.GOAHEAD);
    return;
  }

  // Set up date range
  const baseDate = createDate(selectedBaseDate.value);
  const currentDay = today();
  const startDate = isAfter(baseDate, currentDay) ? baseDate : currentDay;
  const endDate = addDays(startDate, parseInt(searchPeriod.value, 10));

  // Search for available dates
  findMeetupDates(positions, meetupStartTime.value, startDate, endDate);

  // Show results
  showResults.value = true;

  // Persist the search config so it's restored next visit
  saveMeetupParams(
    selectedBaseDate.value,
    participants.value,
    meetupStartTime.value,
    searchPeriod.value,
  );
  syncMeetupUrl();
}

async function initialize() {
  try {
    const result = await initializeApp({
      defaultScheduleData,
      nextScheduleData,
      config,
      eventConfig,
    });

    if (!result) {
      alert(ERROR_MESSAGES.INIT_FAILED);
      return false;
    }

    const validBaseDates = [defaultBaseDate.value, nextBaseDate.value].filter(
      Boolean,
    );

    if (applyFromCanonical(validBaseDates)) {
      // URL already reflects the desired state, no resync needed
      return true;
    }
    if (applyFromStorage(validBaseDates)) {
      syncMeetupUrl();
      return true;
    }
    if (applyFromHomeStorage(validBaseDates)) {
      syncMeetupUrl();
      return true;
    }
    applySelectedBaseDate(defaultBaseDate.value);
    syncMeetupUrl();
    return true;
  } catch (error) {
    alert(ERROR_MESSAGES.INIT_FAILED);
    return false;
  }
}

function applyFromCanonical(validBaseDates) {
  const url = readCanonicalMeetup();
  if (!url) return false;

  // baseDate は config の現行 active を採用（URL には載せない設計）
  const targetBaseDate = nextBaseDate.value || defaultBaseDate.value;
  if (!targetBaseDate) return false;
  const cls = classifyBaseDate(formatAsISODate(targetBaseDate), validBaseDates);
  if (cls.kind !== "active") return false;

  applySelectedBaseDate(cls.baseDate);
  participants.value = url.participants.map((position) => ({ position }));
  meetupStartTime.value = url.startTime;
  searchPeriod.value = String(url.period);

  // URL 由来の値は即 Storage にも書き戻す（次回起動の Storage 解決を有効化）
  saveMeetupParams(
    selectedBaseDate.value,
    participants.value,
    meetupStartTime.value,
    searchPeriod.value,
  );
  return true;
}

function applyFromStorage(validBaseDates) {
  const stored = loadMeetupParams();
  if (!stored) return false;

  const cls = classifyBaseDate(stored.baseDate, validBaseDates);
  if (cls.kind !== "active") {
    clearMeetupParams();
    return false;
  }

  applySelectedBaseDate(cls.baseDate);
  participants.value = stored.participants;
  meetupStartTime.value = stored.startTime;
  searchPeriod.value = String(stored.period);
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
