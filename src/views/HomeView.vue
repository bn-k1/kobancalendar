<!-- src/views/HomeView.vue -->
<template>
  <UnifiedPageLayout layout="calendar">
    <!-- Controls section -->
    <template #controls>
      <div class="horizontal-fields" v-if="isLoaded && selectedBaseDate">
        <BaseSelector
          id="baseDate"
          legend="基準日"
          aria-label="基準日を選択"
          v-model="selectedBaseDate"
          :options="formattedBaseDates"
          :formatter="formatAsDisplayDate"
          @change="handleBaseDateChange"
        />

        <BaseSelector
          id="startNumber"
          legend="基準日のコマ位置"
          aria-label="コマ位置を選択"
          v-model="startPosition"
          :options="positionOptions"
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
        v-if="isLoaded && currentBaseDate"
        :base-date="currentBaseDate"
        :last-base-date="lastBaseDate"
        :start-position="startPosition"
        @export="handleExport"
        @export-complete="handleExportComplete"
      />
    </template>
  </UnifiedPageLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

// Components
import UnifiedPageLayout from "@/layouts/UnifiedPageLayout.vue";
import BaseSelector from "@/components/Controls/BaseSelector.vue";
import CalendarView from "@/components/CalendarView.vue";
import ExportSection from "@/components/ExportSection.vue";

// Composables
import { useCalendar } from "@/composables/useCalendar";
import { useSchedule } from "@/composables/useSchedule";
import { useHolidays } from "@/composables/useHolidays";
import { useAppInitializer } from "@/composables/useAppInitializer";
import { useUrlParams } from "@/composables/useUrlParams";

// Utils
import {
  createDate,
  formatAsISODate,
  formatAsDisplayDate,
  today,
  isSameOrAfter,
  toDate,
} from "@/utils/date";

// Config
import { APP_CONFIG, ERROR_MESSAGES } from "@/utils/constants";
import holidayData from "@data/holiday.csv?raw";
import saturdayData from "@data/saturday.csv?raw";
import weekdayData from "@data/weekday.csv?raw";
import eventConfig from "@config/event.json";
import config from "@config/config.json";

// Composables initialization
const { getDateParam, getNumberParam, updateCalendarParams } = useUrlParams();
const { isLoaded, initializeApp } = useAppInitializer();
const calendarRef = ref(null);
const selectedBaseDate = ref("");

// Calendar composable
const {
  calendarEvents,
  startPosition,
  generateCalendarEvents,
  setStartPosition,
} = useCalendar();

// Schedule composable
const {
  baseDates,
  currentBaseDate,
  lastBaseDate,
  rotationCycleLength,
  updateCurrentBaseDate,
} = useSchedule();

// Computed values
const formattedBaseDates = computed(() => {
  return baseDates.value.map((date) => ({
    value: formatAsISODate(date),
    text: formatAsDisplayDate(date),
  }));
});

const positionOptions = computed(() => {
  return Array.from({ length: rotationCycleLength.value }, (_, i) => ({
    value: i + 1,
    text: String(i + 1),
  }));
});

// Initial date for the calendar
const initialDate = computed(() => {
  if (!currentBaseDate.value) return null;

  const currentDay = today();
  return isSameOrAfter(currentBaseDate.value, currentDay)
    ? toDate(currentBaseDate.value)
    : toDate(currentDay);
});

// Event handlers
function handleBaseDateChange(newDateStr) {
  const newDate = createDate(newDateStr);
  updateCurrentBaseDate(newDate);

  // Update URL params
  updateCalendarParams(newDate, startPosition.value);

  // Navigate calendar if needed
  const currentDay = today();
  if (isSameOrAfter(newDate, currentDay)) {
    calendarRef.value?.gotoDate(newDate);
  } else {
    calendarRef.value?.gotoDate(currentDay);
  }
}

function handlePositionChange(newPosition) {
  setStartPosition(parseInt(newPosition, 10));

  // Update URL params
  updateCalendarParams(selectedBaseDate.value, parseInt(newPosition, 10));

  // Regenerate calendar events if view is available
  if (calendarRef.value?.getApi) {
    const api = calendarRef.value.getApi();
    generateCalendarEvents(
      createDate(api.view.activeStart),
      createDate(api.view.activeEnd),
    );
  }
}

function handleDatesSet({ start, end }) {
  generateCalendarEvents(start, end);
}

function handleExport({ months }) {
  // Implementation remains the same
}

function handleExportComplete({ success, error }) {
  if (!success && error) {
    alert(ERROR_MESSAGES.ICS_EXPORT_ERROR);
  }
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
      eventConfig,
    });

    if (!result) {
      alert(ERROR_MESSAGES.INIT_FAILED);
      return;
    }

    // Get URL parameters
    const baseDateParam = getDateParam("baseDate", null, baseDates.value);
    const startNumberParam = getNumberParam(
      "startNumber",
      APP_CONFIG.DEFAULT_START_POSITION,
      1,
      result.scheduleData.rotationCycleLength,
    );

    // Set current base date
    let validBaseDate;
    if (baseDateParam) {
      validBaseDate = baseDateParam;
      updateCurrentBaseDate(validBaseDate);
    } else if (baseDates.value && baseDates.value.length > 0) {
      validBaseDate = baseDates.value[0];
      updateCurrentBaseDate(validBaseDate);
    } else {
      validBaseDate = today();
      updateCurrentBaseDate(validBaseDate);
    }

    selectedBaseDate.value = formatAsISODate(validBaseDate);

    // Set start position
    setStartPosition(startNumberParam);

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
  await initialize();
});
</script>
