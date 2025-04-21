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
          v-model="startPosition"
          :max-positions="rotationCycleLength"
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
import dayjs from 'dayjs';

// Components
import CalendarPageLayout from '@/layouts/CalendarPageLayout.vue';
import BaseDateSelector from '@/components/Controls/BaseDateSelector.vue';
import PositionSelector from '@/components/Controls/PositionSelector.vue';
import CalendarView from '@/components/Calendar/CalendarView.vue';
import ExportSection from '@/components/ExportSection.vue';

// Composables
import { useSchedule } from '@/composables/useSchedule';
import { useCalendar } from '@/composables/useCalendar';
import { useHolidays } from '@/composables/useHolidays';

// Utils
import { getDateParam, getNumberParam, updateURLParams } from '@/utils/url-params';

// Config
import { APP_CONFIG } from '@/config/constants';
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
const scheduleComposable = useSchedule();
const calendarComposable = useCalendar();
const holidaysComposable = useHolidays();

// Destructure needed values and methods from composables
const { 
  loadScheduleData, 
  setBaseDates, 
  updateCurrentBaseDate,
  setLastBaseDate,
  setCurrentBaseDate
} = scheduleComposable;

const {
  calendarEvents,
  startPosition,
  setStartPosition,
  setEventConfig,
  setICSExportConfig,
  generateCalendarEvents
} = calendarComposable;

const {
  setHolidayYearsRange,
  setUserDefinedHolidays,
  loadHolidays
} = holidaysComposable;

// Computed values
const currentBaseDate = computed(() => scheduleComposable.currentBaseDate.value);
const lastBaseDate = computed(() => scheduleComposable.lastBaseDate.value);
const baseDates = computed(() => scheduleComposable.baseDates.value);
const rotationCycleLength = computed(() => scheduleComposable.scheduleData.value.rotationCycleLength);

// Initial date for the calendar
const initialDate = computed(() => {
  if (!currentBaseDate.value) return null;

  const today = dayjs().startOf('day');
  return currentBaseDate.value.isSameOrAfter(today)
    ? currentBaseDate.value.toDate()
    : today.toDate();
});

// Event handlers
function handleBaseDateChange(newDate) {
  updateCurrentBaseDate(newDate);
  
  // Update URL params
  updateURLParams({
    baseDate: newDate.format('YYYY-MM-DD'),
    startNumber: startPosition.value,
  });
  
  // Navigate calendar if needed
  const today = dayjs().startOf('day');
  if (newDate.isSameOrAfter(today)) {
    calendarRef.value?.gotoDate(newDate);
  } else {
    calendarRef.value?.gotoDate(today);
  }
}

function handlePositionChange(newPosition) {
  // Update URL params
  updateURLParams({
    baseDate: selectedBaseDate.value,
    startNumber: newPosition,
  });
  
  // Regenerate calendar events
  if (calendarRef.value) {
    const api = calendarRef.value.getApi();
    generateCalendarEvents(
      dayjs(api.view.activeStart),
      dayjs(api.view.activeEnd)
    );
  }
}

function handleDatesSet({ start, end }) {
  generateCalendarEvents(start, end);
}

function handleExport({ months }) {
  // Handle export months change
  console.log('Export months changed:', months);
}

function handleExportComplete({ success, error }) {
  if (!success && error) {
    console.error('Export failed:', error);
    alert('エクスポート中にエラーが発生しました。');
  }
}

// Initialize application
async function initializeApp() {
  try {
    // Set holiday config
    setHolidayYearsRange(config.holiday_years_range || 5);
    setUserDefinedHolidays(config.custom_holidays || []);
    
    // Load holidays
    loadHolidays();
    
    // Set calendar config
    setEventConfig(eventConfig);
    setICSExportConfig(config.info);
    
    // Load schedule data
    const scheduleData = loadScheduleData(holidayData, saturdayData, weekdayData);
    
    // Set base dates
    const configBaseDates = config.base_dates
      .map((dateStr) => dayjs(dateStr))
      .sort((a, b) => a.unix() - b.unix());
    
    setBaseDates(configBaseDates);
    setLastBaseDate(configBaseDates[configBaseDates.length - 1]);
    
    // Get URL parameters
    const baseDateParam = getDateParam('baseDate', null, configBaseDates);
    const startNumberParam = getNumberParam(
      'startNumber',
      APP_CONFIG.DEFAULT_START_POSITION,
      1,
      scheduleData.rotationCycleLength
    );
    
    // Set current base date
    const validBaseDate = setCurrentBaseDate(baseDateParam, configBaseDates);
    selectedBaseDate.value = validBaseDate.format('YYYY-MM-DD');
    
    // Set start position
    setStartPosition(startNumberParam);
    
    // Mark as loaded
    isLoaded.value = true;
    
    return true;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    return false;
  }
}

// Watch for base date changes
watch(currentBaseDate, (newBaseDate) => {
  if (newBaseDate) {
    selectedBaseDate.value = newBaseDate.format('YYYY-MM-DD');
  }
});

// Initialize on mount
onMounted(async () => {
  await initializeApp();
});
</script>