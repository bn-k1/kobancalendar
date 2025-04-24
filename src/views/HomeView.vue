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

// Composables - すべての状態とロジックへのアクセスにコンポーサブルを使用
import { useCalendar } from '@/composables/useCalendar';
import { useSchedule } from '@/composables/useSchedule';
import { useHolidays } from '@/composables/useHolidays';

// Utils
import { getDateParam, getNumberParam, updateURLParams } from '@/utils/url-params';
import { formatAsISODate } from '@/utils/date-formatters';

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

// Composables - すべてのストア関連の操作を提供
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
  setCurrentBaseDate 
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

  const today = dayjs().startOf('day');
  return currentBaseDate.value.isSameOrAfter(today)
    ? currentBaseDate.value.toDate()
    : today.toDate();
});

// Event handlers
function handleBaseDateChange(newDate) {
  console.log('Base date changed:', newDate.format('YYYY-MM-DD'));
  updateCurrentBaseDate(newDate);
  
  // Update URL params
  updateURLParams({
    baseDate: formatAsISODate(newDate),
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
  console.log('Position changed:', newPosition);
  setStartPosition(newPosition);
  
  // Update URL params
  updateURLParams({
    baseDate: selectedBaseDate.value,
    startNumber: newPosition,
  });
  
  // Regenerate calendar events if view is available
  if (calendarRef.value) {
    const api = calendarRef.value.getApi();
    generateCalendarEvents(
      dayjs(api.view.activeStart),
      dayjs(api.view.activeEnd)
    );
  }
}

function handleDatesSet({ start, end }) {
  console.log('Calendar dates set:', start.format(), end.format());
  const events = generateCalendarEvents(start, end);
  console.log(`Generated ${events.length} events`);
}

function handleExport({ months }) {
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
    console.log('Initializing application...');
    
    // Set holiday config
    setHolidayYearsRange(config.holiday_years_range || 5);
    setUserDefinedHolidays(config.custom_holidays || []);
    
    // Load holidays
    loadHolidays();
    console.log('Holidays loaded');
    
    // Set calendar config
    setEventConfig(eventConfig);
    setICSExportConfig(config.info);
    console.log('Calendar config set');
    
    // Load schedule data
    const data = loadScheduleData(holidayData, saturdayData, weekdayData);
    console.log('Schedule data loaded:', data.rotationCycleLength, 'rotation cycle length');
    
    // Set base dates
    const configBaseDates = config.base_dates
      .map((dateStr) => dayjs(dateStr))
      .sort((a, b) => a.unix() - b.unix());
    
    setBaseDates(configBaseDates);
    setLastBaseDate(configBaseDates[configBaseDates.length - 1]);
    console.log('Base dates set:', configBaseDates.map(d => d.format('YYYY-MM-DD')));
    
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
    console.log('Current base date set:', selectedBaseDate.value);
    
    // Set start position
    setStartPosition(startNumberParam);
    console.log('Start position set:', startNumberParam);
    
    // Mark as loaded
    isLoaded.value = true;
    console.log('Application initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize app:', error);
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