<!-- src/views/MeetupView.vue -->
<template>
  <MeetupPageLayout :show-results="showResults">
    <!-- Search controls section -->
    <template #search-controls>
      <div class="search-controls">
        <!-- Base date selector -->
        <fieldset id="baseDateSection" class="control-group" v-if="isLoaded">
          <legend>基準日</legend>
          <div class="form-group">
            <!-- For single base date -->
            <span v-if="baseDates.length === 1">
              {{ selectedBaseDate }}
            </span>

            <!-- For multiple base dates -->
            <select
              v-else
              id="baseDate"
              aria-label="基準日を選択"
              v-model="selectedBaseDate"
              @change="handleBaseDateChange"
            >
              <option
                v-for="date in baseDates"
                :key="formatAsISODate(date)"
                :value="formatAsISODate(date)"
              >
                {{ formatAsDisplayDate(date) }}
              </option>
            </select>
          </div>
        </fieldset>

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
      <ResultsDisplay
        :results="searchResults"
      />
    </template>
  </MeetupPageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Components
import MeetupPageLayout from '@/layouts/MeetupPageLayout.vue';
import ParticipantsList from '@/components/Controls/ParticipantsList.vue';
import ResultsDisplay from '@/components/ResultsDisplay.vue';

// Composables
import { useSchedule } from '@/composables/useSchedule';
import { useCalendar } from '@/composables/useCalendar';
import { useHolidays } from '@/composables/useHolidays';
import { useMeetupSearch } from '@/composables/useMeetupSearch';

// Utils
import { 
  getURLParam, 
  updateURLParams 
} from '@/utils/url-params';
import { 
  createDate,
  formatAsISODate, 
  formatAsDisplayDate,
  today,
  isAfter,
  addDays
} from '@/utils/date';

// Config
import { APP_CONFIG, ERROR_MESSAGES } from '@/config/constants';
import eventConfig from '@/config/event.json';
import config from '@/config/config.json';

// Local state
const isLoaded = ref(false);
const selectedBaseDate = ref('');
const meetupStartTime = ref(APP_CONFIG.DEFAULT_MEETUP_START_TIME);
const searchPeriod = ref(APP_CONFIG.DEFAULT_SEARCH_PERIOD.toString());
const participants = ref([{ position: '' }]);
const showResults = ref(false);

// Composables
const scheduleComposable = useSchedule();
const calendarComposable = useCalendar();
const holidaysComposable = useHolidays();
const meetupSearchComposable = useMeetupSearch();

// Extract values and methods from composables
const { 
  setBaseDates, 
  updateCurrentBaseDate,
  setLastBaseDate
} = scheduleComposable;

const {
  setEventConfig,
  setICSExportConfig
} = calendarComposable;

const {
  setHolidayYearsRange,
  setUserDefinedHolidays,
  loadHolidays
} = holidaysComposable;

const {
  searchResults,
  findMeetupDates
} = meetupSearchComposable;

// Computed values
const baseDates = computed(() => scheduleComposable.baseDates.value);
const rotationCycleLength = computed(() => scheduleComposable.scheduleData.value.rotationCycleLength);

// Event handlers
function handleBaseDateChange() {
  const newBaseDate = createDate(selectedBaseDate.value);
  updateCurrentBaseDate(newBaseDate);
  
  // Update URL
  updateAllURLParams();
}

function handleParticipantsChange(validParticipants) {
  // Update URL with participants
  const participantsParam = validParticipants
    .map(p => p.position)
    .join(',');
    
  updateURLParams({ participants: participantsParam });
}

// Update all URL parameters
function updateAllURLParams() {
  // Extract valid participants
  const validParticipants = participants.value
    .filter(p => p.position)
    .map(p => p.position)
    .join(',');
  
  // Update URL
  updateURLParams({
    baseDate: selectedBaseDate.value,
    participants: validParticipants
  });
}

// Find available dates
function findDates() {
  // Get valid participant positions
  const positions = participants.value
    .map(p => parseInt(p.position))
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
  const endDate = addDays(startDate, parseInt(searchPeriod.value));
  
  // Search for available dates
  findMeetupDates(
    positions,
    meetupStartTime.value,
    startDate,
    endDate
  );
  
  // Show results
  showResults.value = true;
}

// Initialize application
async function initializeApp() {
  try {
    // Holiday configuration
    setHolidayYearsRange(config.holiday_years_range || 5);
    setUserDefinedHolidays(config.custom_holidays || []);
    loadHolidays();
    
    // Calendar configuration
    setEventConfig(eventConfig);
    setICSExportConfig(config.info);
    
    // Set base dates
    const configBaseDates = config.base_dates
      .map(dateStr => createDate(dateStr))
      .sort((a, b) => a.unix() - b.unix());
      
    setBaseDates(configBaseDates);
    setLastBaseDate(configBaseDates[configBaseDates.length - 1]);
    
    // Get URL parameters
    const baseDateParam = getURLParam('baseDate', '');
    const participantsParam = getURLParam('participants', '');
    
    // Apply base date parameter
    if (baseDateParam) {
      const dateObj = createDate(baseDateParam);
      if (dateObj.isValid()) {
        updateCurrentBaseDate(dateObj);
        selectedBaseDate.value = formatAsISODate(dateObj);
      } else {
        // Use default
        const defaultBaseDate = configBaseDates[0];
        updateCurrentBaseDate(defaultBaseDate);
        selectedBaseDate.value = formatAsISODate(defaultBaseDate);
      }
    } else {
      // Use default
      const defaultBaseDate = configBaseDates[0];
      updateCurrentBaseDate(defaultBaseDate);
      selectedBaseDate.value = formatAsISODate(defaultBaseDate);
    }
    
    // Apply participants parameter
    if (participantsParam) {
      const positionList = participantsParam
        .split(',')
        .map(p => parseInt(p))
        .filter(p => !isNaN(p));
        
      if (positionList.length > 0) {
        participants.value = positionList.map(position => ({ position }));
      }
    }
    
    // Mark as loaded
    isLoaded.value = true;
    
    return true;
  } catch (error) {
    console.error(ERROR_MESSAGES.INIT_FAILED, error);
    return false;
  }
}

// Initialize on mount
onMounted(async () => {
  await initializeApp();
});
</script>
