// src/views/MeetupView.vue
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
          :options="formattedBaseDates"
          :formatter="formatAsDisplayDate"
          :display-as-text="formattedBaseDates.length === 1"
          :schedule-update-notice="scheduleUpdateNotice"
          @change="handleBaseDateChange"
          v-if="isLoaded"
        />

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
import { useUrlParams } from "@/composables/useUrlParams";
import { useMeetupSearch } from "@/composables/useMeetupSearch";

// Utils
import {
  createDate,
  formatAsISODate,
  formatAsDisplayDate,
  today,
  isAfter,
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
  getDateParam,
  getNumberParam,
  getStringParam,
  getParticipantsFromParams,
  updateMeetupParams,
} = useUrlParams();
const { searchResults, findMeetupDates } = useMeetupSearch();

// Schedule composable
const {
  defaultBaseDate,
  activeBaseDate,
  nextBaseDate,
  rotationCycleLength,
  scheduleUpdateDate,
  updateActiveBaseDate,
} = useSchedule();

// Computed values
const formattedBaseDates = computed(() => {
  const dates = [];

  // Add default base date
  if (defaultBaseDate.value) {
    dates.push({
      value: formatAsISODate(defaultBaseDate.value),
      text: formatAsDisplayDate(defaultBaseDate.value),
    });
  }

  // Add next base date if it exists, is valid, and is different from default
  if (
    nextBaseDate.value &&
    nextBaseDate.value.isValid &&
    nextBaseDate.value.isValid() &&
    !(
      defaultBaseDate.value &&
      formatAsISODate(defaultBaseDate.value) ===
        formatAsISODate(nextBaseDate.value)
    )
  ) {
    dates.push({
      value: formatAsISODate(nextBaseDate.value),
      text: formatAsDisplayDate(nextBaseDate.value),
    });
  }

  return dates;
});

const scheduleUpdateNotice = computed(() => {
  if (scheduleUpdateDate.value) {
    return formatAsDisplayDate(scheduleUpdateDate.value);
  }
  return "";
});

// Event handlers
function handleBaseDateChange(newDateStr) {
  const newDate = createDate(newDateStr);
  updateActiveBaseDate(newDate);

  if (showResults.value) {
    showResults.value = false;
  }
}

// Find available dates
function findDates() {
  // Get valid participant positions
  const positions = participants.value
    .map((p) => parseInt(p.position, 10))
    .filter((p) => !isNaN(p));

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

  // Update URL with all parameters
  updateMeetupParams(selectedBaseDate.value, participants.value, {
    startTime: meetupStartTime.value,
    period: searchPeriod.value,
  });
}

// Initialize application
async function initialize() {
  try {
    // Initialize app with shared logic and consolidated data
    const result = await initializeApp({
      defaultScheduleData,
      nextScheduleData,
      config,
      eventConfig,
    });

    if (!result) {
      alert(ERROR_MESSAGES.INIT_FAILED);
      return;
    }

    // Get URL parameters
    const validBaseDates = [defaultBaseDate.value, nextBaseDate.value].filter(
      Boolean,
    );
    const baseDateParam = getDateParam("baseDate", undefined, validBaseDates);
    const participantsFromUrl = getParticipantsFromParams();
    const startTimeParam = getStringParam("startTime", meetupStartTime.value);
    const periodParam = getNumberParam(
      "period",
      parseInt(searchPeriod.value, 10),
    );

    // Apply base date parameter
    if (baseDateParam) {
      const dateObj = createDate(baseDateParam);
      if (dateObj.isValid()) {
        updateActiveBaseDate(dateObj);
        selectedBaseDate.value = formatAsISODate(dateObj);
      } else {
        // Use default
        updateActiveBaseDate(defaultBaseDate.value);
        selectedBaseDate.value = formatAsISODate(defaultBaseDate.value);
      }
    } else {
      // Use default
      updateActiveBaseDate(defaultBaseDate.value);
      selectedBaseDate.value = formatAsISODate(defaultBaseDate.value);
    }

    // Apply participants parameter
    if (participantsFromUrl.length > 0) {
      participants.value = participantsFromUrl;
    }

    // Apply other parameters
    if (startTimeParam) meetupStartTime.value = startTimeParam;
    if (periodParam) searchPeriod.value = periodParam.toString();

    // Automatically run search if there are 2 or more participants
    const validParticipants = participants.value
      .map((p) => parseInt(p.position, 10))
      .filter((p) => !isNaN(p));

    if (validParticipants.length >= 2) {
      // Use setTimeout to ensure the component is fully mounted and reactive
      setTimeout(() => {
        findDates();
      }, 0);
    }

    return true;
  } catch (error) {
    alert(ERROR_MESSAGES.INIT_FAILED);
    return false;
  }
}

// Watch for base date changes from composable
watch(activeBaseDate, (newBaseDate) => {
  if (newBaseDate) {
    selectedBaseDate.value = formatAsISODate(newBaseDate);
  }
});

// Initialize on mount
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
</style>