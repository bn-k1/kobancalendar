<template>
  <UnifiedPageLayout layout="meetup" :show-results="showResults">
    <!-- Search controls section -->
    <template #search-controls>
      <div class="search-controls">
        <!-- Base date selector -->
        <BaseSelector
          id="baseDate"
          legend="基準日"
          aria-label="基準日を選択"
          v-model="selectedBaseDate"
          :display-as-text="true"
          :display-value="activeBaseDate ? formatAsDisplayDate(activeBaseDate) : ''"
          :options="[]"
          :schedule-update-notice="scheduleUpdateNotice"
          v-if="isLoaded"
        >
          <div v-if="nextBaseDateStr && selectedBaseDate !== nextBaseDateStr" class="version-link-row">
            <button class="version-btn" @click="switchToNextBaseDate">
              新版: {{ formatAsDisplayDate(nextBaseDate) }}~
            </button>
          </div>
        </BaseSelector>

        <!-- Meetup settings -->
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
              <option v-for="time in TIMEOPTIONS" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="searchPeriod">検索期間:</label>
            <select
              id="searchPeriod"
              aria-label="検索期間"
              v-model="searchPeriod"
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
        id="findDatesBtn"
        class="primary-btn action-btn"
        v-if="isLoaded"
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
import {
  ref,
  computed,
  onMounted,
  watch,
  defineAsyncComponent,
} from "vue";

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
import { useUrlParams } from "@/composables/useUrlParams";
import { useLocalParams } from "@/composables/useLocalParams";
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
const { hasLegacyUrlParams, readLegacyUrlParams, clearUrl } = useUrlParams();
const {
  saveMeetupParams,
  loadMeetupParams,
  clearMeetupParams,
} = useLocalParams();
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
  if (formatAsISODate(nextBaseDate.value) === formatAsISODate(defaultBaseDate.value)) return null;
  return formatAsISODate(nextBaseDate.value);
});

function toValidPositionNumbers(items) {
  return items
    .map((p) => parseInt(p.position, 10))
    .filter((p) => !isNaN(p));
}

function applySelectedBaseDate(dateObj) {
  updateActiveBaseDate(dateObj);
  selectedBaseDate.value = formatAsISODate(dateObj);
}

function switchToNextBaseDate() {
  const nextDateObj = createDate(nextBaseDateStr.value);
  applySelectedBaseDate(nextDateObj);
  showResults.value = false;
}

function classifyBaseDate(baseDateStr, validBaseDates) {
  if (!baseDateStr) return { kind: "empty" };
  const dateObj = createDate(baseDateStr);
  if (!dateObj.isValid()) return { kind: "invalid" };
  if (validBaseDates.some((d) => d && isSameDay(d, dateObj))) {
    return { kind: "active", baseDate: dateObj };
  }
  return { kind: "unknown" }; // includes old_base_date — meetup can't migrate a list via the modal
}

function parseLegacyMeetupFields(rawParams) {
  const positions = rawParams.participants
    ? rawParams.participants
        .split(",")
        .map((p) => parseInt(p, 10))
        .filter((p) => !isNaN(p))
    : [];
  const startTime = rawParams.startTime || null;
  const periodNum = parseInt(rawParams.period, 10);
  const period = isNaN(periodNum) ? null : periodNum;
  return { positions, startTime, period };
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
}

async function initialize() {
  const hadUrlParams = hasLegacyUrlParams();
  const legacyParams = hadUrlParams ? readLegacyUrlParams() : null;
  if (hadUrlParams) clearUrl();

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

    const applied = legacyParams
      ? applyFromLegacy(legacyParams, validBaseDates)
      : applyFromStorage(validBaseDates);

    if (!applied) {
      applySelectedBaseDate(defaultBaseDate.value);
    }
    return true;
  } catch (error) {
    alert(ERROR_MESSAGES.INIT_FAILED);
    return false;
  }
}

function applyFromLegacy(rawParams, validBaseDates) {
  const cls = classifyBaseDate(rawParams.baseDate, validBaseDates);

  if (cls.kind === "empty") {
    alert(ERROR_MESSAGES.NO_BASE_DATE);
    return false;
  }
  if (cls.kind === "invalid") {
    console.error(`${ERROR_MESSAGES.INVALID_URL_PARAM}: baseDate`);
    return false;
  }
  if (cls.kind !== "active") {
    return false;
  }

  applySelectedBaseDate(cls.baseDate);

  const { positions, startTime, period } = parseLegacyMeetupFields(rawParams);
  if (positions.length > 0) {
    participants.value = positions.map((position) => ({ position }));
  }
  if (startTime) meetupStartTime.value = startTime;
  if (period) searchPeriod.value = String(period);

  // Persist the imported URL state so next visit reads from localStorage
  if (positions.length > 0 && startTime && period) {
    saveMeetupParams(
      formatAsISODate(cls.baseDate),
      participants.value,
      meetupStartTime.value,
      searchPeriod.value,
    );
  }

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
  gap: var(--spacing-md);
}

@media screen and (min-width: 768px) {
  .search-controls {
    flex-direction: row;
  }
  .search-controls > * {
    flex: 1;
  }
}

.loading-placeholder {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-100);
  border-radius: var(--border-radius-lg);
  font-size: 1.1rem;
  color: var(--gray-600);
  margin: var(--spacing-md) 0;
}

.version-link-row {
  flex-basis: 100%;
  margin-top: var(--spacing-xs);
}
.version-btn {
  font-size: 0.78rem;
  padding: 0.1rem 0.45rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.version-btn:hover {
  background: var(--primary-color);
  color: var(--text-light);
}
</style>
