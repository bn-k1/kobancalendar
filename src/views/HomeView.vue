// src/views/HomeView.vue
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
          :display-as-text="formattedBaseDates.length === 1"
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
      <Suspense>
        <CalendarView
          ref="calendarRef"
          :initial-date="initialDate"
          :start-position="startPosition"
          :events="calendarEvents"
          @dates-set="handleDatesSet"
        />
        <template #fallback>
          <div class="loading-placeholder">Loading...</div>
        </template>
      </Suspense>
    </template>

    <!-- Export section -->
    <template #export>
      <ExportSection
        v-if="isLoaded && activeBaseDate"
        :base-date="activeBaseDate"
        :next-base-date="nextBaseDate"
        :start-position="startPosition"
        :url="config.url"
        @export-complete="handleExportComplete"
      />
    </template>
  </UnifiedPageLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from "vue";

// Layout component (always loaded)
import UnifiedPageLayout from "@/layouts/UnifiedPageLayout.vue";
import BaseSelector from "@/components/Controls/BaseSelector.vue";

// Lazy load components that aren't needed immediately
const CalendarView = defineAsyncComponent(
  () => import("@/components/CalendarView.vue"),
);
const ExportSection = defineAsyncComponent(
  () => import("@/components/ExportSection.vue"),
);

// Composables
import { useCalendar } from "@/composables/useCalendar";
import { useSchedule } from "@/composables/useSchedule";
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
import { ERROR_MESSAGES } from "@/utils/constants";

// Import consolidated JSON data
import defaultScheduleData from "@data/default/default.json";
import nextScheduleData from "@data/next/next.json";
import eventConfig from "@config/event.json";
import config from "@config/config.json";

// Composables initialization
const { getDateParam, getNumberParam, updateCalendarParams } = useUrlParams();
const { isLoaded, initializeApp } = useAppInitializer();
const calendarRef = ref(undefined);
const selectedBaseDate = ref("");

// Calendar composable
const {
  calendarEvents,
  startPosition: computedStartPosition,
  generateCalendarEvents,
  setStartPosition,
} = useCalendar();

// Schedule composable
const {
  defaultBaseDate,
  activeBaseDate,
  nextBaseDate,
  rotationCycleLength,
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

const positionOptions = computed(() => {
  return Array.from({ length: rotationCycleLength.value }, (_, i) => ({
    value: i + 1,
    text: String(i + 1),
  }));
});

// Initial date for the calendar
const initialDate = computed(() => {
  if (!activeBaseDate.value) return undefined;

  const currentDay = today();
  return isSameOrAfter(activeBaseDate.value, currentDay)
    ? toDate(activeBaseDate.value)
    : toDate(currentDay);
});

const startPosition = ref(undefined);

// Event handlers
function handleBaseDateChange(newDateStr) {
  const newDate = createDate(newDateStr);
  updateActiveBaseDate(newDate);
  startPosition.value = undefined;
  setStartPosition(undefined);

  // Update URL params
  updateCalendarParams(newDate, startPosition.value);
}

function handlePositionChange(newPosition) {
  const positionValue = parseInt(newPosition, 10);
  startPosition.value = positionValue;
  setStartPosition(positionValue);

  updateCalendarParams(selectedBaseDate.value, positionValue);
}

function handleDatesSet({ start, end }) {
  generateCalendarEvents(start, end);
}

function handleExportComplete({ success, error }) {
  if (!success && error) {
    alert(ERROR_MESSAGES.ICS_EXPORT_ERROR);
  }
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
    const startNumberParam = getNumberParam(
      "startNumber",
      undefined,
      1,
      result.scheduleData.rotationCycleLength,
    );

    // Set active base date
    let validBaseDate;
    if (baseDateParam) {
      validBaseDate = baseDateParam;
      updateActiveBaseDate(validBaseDate);
    } else if (defaultBaseDate.value) {
      validBaseDate = defaultBaseDate.value;
      updateActiveBaseDate(validBaseDate);
    } else {
      console.error(ERROR_MESSAGES.NO_BASE_DATE);
      return false;
    }

    selectedBaseDate.value = formatAsISODate(validBaseDate);

    if (!baseDateParam || !startNumberParam) {
      setStartPosition(undefined);
      return true;
    }

    setStartPosition(startNumberParam);
    return true;
  } catch (error) {
    console.error(ERROR_MESSAGES.INIT_FAILED, error);
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

watch(computedStartPosition, (newValue) => {
  if (newValue && newValue !== startPosition.value) {
    startPosition.value = newValue;
  }
});

// Initialize on mount
onMounted(async () => {
  await initialize();
});
</script>

<style scoped>
.loading-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-100);
  border-radius: var(--border-radius-lg);
  font-size: 1.2rem;
  color: var(--gray-600);
}
</style>
