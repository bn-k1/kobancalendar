<!-- src/views/HomeView.vue -->
<template>
  <CalendarPageLayout>
    <!-- Controls section -->
    <template #controls>
      <div class="horizontal-fields" v-if="isLoaded">
        <BaseDateSelector
          v-model="selectedBaseDate"
          :available-dates="baseDates"
          @change="handleBaseDateChange"
        />
        
       	<PositionSelector
	  :modelValue="startPosition"
	  :max-positions="rotationCycleLength"
	  @update:modelValue="setStartPosition"
	  @change="handlePositionChange"
	/>
      </div>
    </template>
    
    <!-- Calendar section -->
    <template #calendar>
      <CalendarView
        ref="calendarRef"
        :initial-date="initialDate"
        :start-position="startPosition"
        :events="calendarEvents"
        @dates-set="handleDatesSet"
      />
    </template>
    
    <!-- Export section -->
    <template #export>
      <ExportSection
        v-if="isLoaded"
        :base-date="currentBaseDate"
        :last-base-date="lastBaseDate"
        :start-position="startPosition"
        @export="handleExport"
        @export-complete="handleExportComplete"
      />
    </template>
  </CalendarPageLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Components
import CalendarPageLayout from '@/layouts/CalendarPageLayout.vue';
import BaseDateSelector from '@/components/Controls/BaseDateSelector.vue';
import PositionSelector from '@/components/Controls/PositionSelector.vue';
import CalendarView from '@/components/Calendar/CalendarView.vue';
import ExportSection from '@/components/ExportSection.vue';

// Composables
import { useCalendar } from '@/composables/useCalendar';
import { useSchedule } from '@/composables/useSchedule';
import { useHolidays } from '@/composables/useHolidays';

// Utils
import { getDateParam, getNumberParam, updateURLParams } from '@/utils/url-params';
import { 
  createDate,
  formatAsISODate,
  formatAsDisplayDate, 
  today, 
  isSameOrAfter, 
  toDate, 
} from '@/utils/date';

// Config
import { APP_CONFIG, ERROR_MESSAGES } from '@/config/constants';
import holidayData from '@/data/holiday.csv?raw';
import saturdayData from '@/data/saturday.csv?raw';
import weekdayData from '@/data/weekday.csv?raw';
import eventConfig from '@/config/event.json';
import config from '@/config/config.json';

// Local state
const isLoaded = ref(false);
const calendarRef = ref(null);
const selectedBaseDate = ref(null);

// Composables
const { 
  calendarEvents, 
  startPosition, 
  generateCalendarEvents, 
  setStartPosition, 
  setEventConfig, 
  setICSExportConfig 
} = useCalendar();

const { 
  scheduleData, 
  baseDates, 
  currentBaseDate, 
  lastBaseDate, 
  loadScheduleData, 
  setBaseDates, 
  updateCurrentBaseDate, 
  setLastBaseDate, 
} = useSchedule();

const { 
  setHolidayYearsRange, 
  setUserDefinedHolidays, 
  loadHolidays 
} = useHolidays();

// Computed values
const rotationCycleLength = computed(() => scheduleData.value.rotationCycleLength);

// Initial date for the calendar
const initialDate = computed(() => {
  if (!currentBaseDate.value) return null;

  const currentDay = today();
  return isSameOrAfter(currentBaseDate.value, currentDay)
    ? toDate(currentBaseDate.value)
    : toDate(currentDay);
});

// Event handlers
function handleBaseDateChange(newDate) {
  updateCurrentBaseDate(newDate);
  
  // Update URL params
  updateURLParams({
    baseDate: formatAsISODate(newDate),
    startNumber: startPosition.value,
  });
  
  // Navigate calendar if needed
  const currentDay = today();
  if (isSameOrAfter(newDate, currentDay)) {
    calendarRef.value?.gotoDate(newDate);
  } else {
    calendarRef.value?.gotoDate(currentDay);
  }
}

function handlePositionChange(newPosition) {
  setStartPosition(newPosition);
  
  // Update URL params
  updateURLParams({
    baseDate: selectedBaseDate.value,
    startNumber: newPosition,
  });
  
  // Regenerate calendar events if view is available
  if (calendarRef.value && calendarRef.value.getApi) {
      const api = calendarRef.value.getApi();
      generateCalendarEvents(
        createDate(api.view.activeStart),
        createDate(api.view.activeEnd)
      );
  }
}

function handleDatesSet({ start, end }) {
  const events = generateCalendarEvents(start, end);
}

function handleExport({ months }) {
  // Implementation remains unchanged
}

function handleExportComplete({ success, error }) {
  if (!success && error) {
    alert(ERROR_MESSAGES.ICS_EXPORT_ERROR);
  }
}

// Initialize application
async function initializeApp() {
  try {
    
    // Set holiday config
    setHolidayYearsRange(APP_CONFIG.DEFAULT_HOLIDAY_YEARS);
    setUserDefinedHolidays(config.custom_holidays || []);
    
    // Load holidays
    loadHolidays();
    
    // Set calendar config
    setEventConfig(eventConfig);
    setICSExportConfig(config.info);
    
    // Load schedule data
    const data = loadScheduleData(holidayData, saturdayData, weekdayData);
    
    // Set base dates
    const configBaseDates = config.base_dates
      .map((dateStr) => createDate(dateStr))
      .sort((a, b) => a.unix() - b.unix());
    
    setBaseDates(configBaseDates);
    setLastBaseDate(configBaseDates[configBaseDates.length - 1]);
    
    // Get URL parameters
    const baseDateParam = getDateParam('baseDate', null, configBaseDates);
    const startNumberParam = getNumberParam(
      'startNumber',
      APP_CONFIG.DEFAULT_START_POSITION,
      1,
      data.rotationCycleLength
    );
    
    // Set current base date
    let validBaseDate;
    if (baseDateParam) {
      validBaseDate = baseDateParam;
      updateCurrentBaseDate(validBaseDate);
    } else {
      validBaseDate = configBaseDates[0];
      updateCurrentBaseDate(validBaseDate);
    }
    
    selectedBaseDate.value = formatAsISODate(validBaseDate);
    
    // Set start position
    setStartPosition(startNumberParam);
    
    // Mark as loaded
    isLoaded.value = true;
    
    return true;
  } catch (error) {
    console.error(ERROR_MESSAGES.INIT_FAILED, error);
    alert(ERROR_MESSAGES.INIT_FAILED);
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
  await initializeApp();
});
</script>
