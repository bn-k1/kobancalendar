<!-- src/views/MeetupView.vue -->
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
          @change="handleBaseDateChange"
          v-if="isLoaded"
        />

        <!-- Meetup settings -->
        <fieldset id="meetupSettingsSection" class="control-group" v-if="isLoaded">
          <legend>検索条件</legend>
          <div class="form-group">
            <label for="meetupStartTime">飲会開始:</label>
            <select
              id="meetupStartTime"
              aria-label="飲み会開始時間"
              v-model="meetupStartTime"
            >
              <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="searchPeriod">検索期間:</label>
            <select
              id="searchPeriod"
              aria-label="検索期間"
              v-model="searchPeriod"
            >
              <option v-for="period in periodOptions" :key="period.value" :value="period.value">
                {{ period.text }}
              </option>
            </select>
          </div>
        </fieldset>
      </div>
    </template>

    <!-- Participants section -->
    <template #participants>
      <ParticipantsList
        v-if="isLoaded"
        v-model="participants"
        :rotation-cycle-length="rotationCycleLength"
        @change="handleParticipantsChange"
      />
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
      <ResultsDisplay :results="searchResults" />
    </template>
  </UnifiedPageLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

// Components
import UnifiedPageLayout from "@/layouts/UnifiedPageLayout.vue";
import BaseSelector from "@/components/Controls/BaseSelector.vue";
import ParticipantsList from "@/components/Controls/ParticipantsList.vue";
import ResultsDisplay from "@/components/ResultsDisplay.vue";

// Composables
import { useSchedule } from "@/composables/useSchedule";
import { useCalendar } from "@/composables/useCalendar";
import { useHolidays } from "@/composables/useHolidays";
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
import { APP_CONFIG, ERROR_MESSAGES } from "@/utils/constants";
import holidayData from "@data/holiday.csv?raw";
import saturdayData from "@data/saturday.csv?raw";
import weekdayData from "@data/weekday.csv?raw";
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
const { getDateParam, getParticipantsFromParams, updateMeetupParams } = useUrlParams();
const { searchResults, findMeetupDates } = useMeetupSearch();

// Schedule composable
const {
  baseDates,
  currentBaseDate,
  rotationCycleLength,
  updateCurrentBaseDate
} = useSchedule();

// Computed values
const formattedBaseDates = computed(() => {
  return baseDates.value.map(date => ({
    value: formatAsISODate(date),
    text: formatAsDisplayDate(date)
  }));
});

// Options for time and period selectors
const timeOptions = [
  "12:00", "13:00", "14:00", "15:00", "16:00", 
  "17:00", "18:00", "19:00", "20:00", "21:00"
];

const periodOptions = [
  { value: "30", text: "1ヶ月" },
  { value: "60", text: "2ヶ月" },
  { value: "90", text: "3ヶ月" },
  { value: "120", text: "4ヶ月" },
  { value: "150", text: "5ヶ月" },
  { value: "180", text: "6ヶ月" }
];

// Event handlers
function handleBaseDateChange(newDateStr) {
  const newDate = createDate(newDateStr);
  updateCurrentBaseDate(newDate);

  // Update URL params
  updateMeetupParams(newDate, participants.value);
}

function handleParticipantsChange(validParticipants) {
  // Update URL with participants
  updateMeetupParams(selectedBaseDate.value, validParticipants);
}

// Find available dates
function findDates() {
  // Get valid participant positions
  const positions = participants.value
    .map(p => parseInt(p.position, 10))
    .filter(p => !isNaN(p));

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
    period: searchPeriod.value
  });
}

// Initialize application
async function initialize() {
  try {
    // Initialize app with shared logic
    const result = await initializeApp({
      holidayData,
      saturdayData,
      weekdayData,
      config,
      eventConfig
    });

    if (!result) {
      alert(ERROR_MESSAGES.INIT_FAILED);
      return;
    }

    // Get URL parameters
    const baseDateParam = getDateParam("baseDate", "");
    const participantsFromUrl = getParticipantsFromParams();
    const startTimeParam = getDateParam("startTime", meetupStartTime.value);
    const periodParam = getDateParam("period", searchPeriod.value);

    // Apply base date parameter
    if (baseDateParam) {
      const dateObj = createDate(baseDateParam);
      if (dateObj.isValid()) {
        updateCurrentBaseDate(dateObj);
        selectedBaseDate.value = formatAsISODate(dateObj);
      } else {
        // Use default
        const defaultBaseDate = baseDates.value[0];
        updateCurrentBaseDate(defaultBaseDate);
        selectedBaseDate.value = formatAsISODate(defaultBaseDate);
      }
    } else {
      // Use default
      const defaultBaseDate = baseDates.value[0];
      updateCurrentBaseDate(defaultBaseDate);
      selectedBaseDate.value = formatAsISODate(defaultBaseDate);
    }

    // Apply participants parameter
    if (participantsFromUrl.length > 0) {
      participants.value = participantsFromUrl;
    }
    
    // Apply other parameters
    if (startTimeParam) meetupStartTime.value = startTimeParam;
    if (periodParam) searchPeriod.value = periodParam;

    return true;
  } catch (error) {
    console.error("Failed to initialize app:", error);
    return false;
  }
}

// Watch for base date changes from composable
watch(currentBaseDate, (newBaseDate) => {
  if (newBaseDate) {
    selectedBaseDate.value = formatAsISODate(newBaseDate);
  }
});

// Initialize on mount
onMounted(async () => {
  await initialize();
});
</script>