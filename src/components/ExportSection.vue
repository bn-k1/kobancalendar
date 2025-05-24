<!-- src/components/ExportSection.vue -->
<template>
  <fieldset id="exportSection" class="control-group">
    <legend>エクスポート</legend>
    <div class="export-date-selectors">
      <div class="date-selector-group">
        <select
          id="exportStartDate"
          v-model="selectedStartDate"
          aria-label="エクスポート開始日"
          class="date-select"
          @change="handleStartDateChange"
        >
          <option value="" disabled>開始日を選択</option>
          <option
            v-for="date in availableDates"
            :key="date.value"
            :value="date.value"
          >
            {{ date.text }}
          </option>
        </select>
      </div>

      <span class="date-separator">から</span>

      <div class="date-selector-group">
        <select
          id="exportEndDate"
          v-model="selectedEndDate"
          aria-label="エクスポート終了日"
          class="date-select"
          :disabled="!selectedStartDate"
        >
          <option value="" disabled>終了日を選択</option>
          <option
            v-for="date in availableEndDates"
            :key="date.value"
            :value="date.value"
          >
            {{ date.text }}
          </option>
        </select>
      </div>

      <span class="date-separator">まで</span>

      <button
        id="exportButton"
        class="export-button"
        aria-label="ICSをダウンロード"
        :disabled="!canExport"
        @click="handleExportICS"
      >
        ダウンロード
      </button>
    </div>
  </fieldset>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useIcsExport } from "@/composables/useIcsExport";
import { APP_CONFIG } from "@/utils/constants";
import {
  createDate,
  today,
  addDays,
  addMonths,
  formatAsISODate,
  formatAsDisplayDate,
  isSameDay,
  isAfter,
  isBefore,
  isSameOrBefore,
} from "@/utils/date";

const props = defineProps({
  baseDate: {
    type: [Date, Object],
    required: true,
  },
  nextBaseDate: {
    type: [Date, Object],
    required: true,
  },
  startPosition: {
    type: Number,
    required: false,
  },
});

const emit = defineEmits(["export", "export-complete"]);

// State
const selectedStartDate = ref("");
const selectedEndDate = ref("");
const { exportICS } = useIcsExport();

// Calculate the earliest available start date
const startDay = computed(() => {
  return isSameDay(props.baseDate, props.nextBaseDate)
    ? createDate(props.nextBaseDate)
    : today();
});

// Default start date (today or base date, whichever is later)
const defaultStartDate = computed(() => formatAsISODate(startDay.value));

// Default end date (1 month from start, or limited by nextBaseDate)
const defaultEndDate = computed(() => {
  const endDate = addDays(addMonths(startDay.value, 1), -1);

  // Apply nextBaseDate limit if applicable
  if (hasEndDateLimit.value) {
    const limitDate = addDays(props.nextBaseDate, -1);
    return formatAsISODate(isBefore(endDate, limitDate) ? endDate : limitDate);
  }

  return formatAsISODate(endDate);
});

// Check if end date should be limited by nextBaseDate
const hasEndDateLimit = computed(() => {
  // No limit if nextBaseDate is not set
  if (!props.nextBaseDate) return false;

  // No limit if baseDate == nextBaseDate (using next period data)
  if (isSameDay(props.baseDate, props.nextBaseDate)) return false;

  // Apply limit if baseDate is active and nextBaseDate is in the future
  return isAfter(props.nextBaseDate, props.baseDate);
});

// Maximum selectable end date
const maxEndDate = computed(() => {
  if (hasEndDateLimit.value) {
    // Limited to day before nextBaseDate
    return addDays(props.nextBaseDate, -1);
  }

  // No limit: 90 days from start
  return addDays(startDay.value, APP_CONFIG.EXPORT_MAX_DAYS - 1);
});

// Generate available start date options
const availableDates = computed(() => {
  const dates = [];
  const maxDays = hasEndDateLimit.value
    ? Math.min(
        APP_CONFIG.EXPORT_MAX_DAYS,
        props.nextBaseDate.diff(startDay.value, "day"),
      )
    : APP_CONFIG.EXPORT_MAX_DAYS;

  for (let i = 0; i < maxDays; i++) {
    const date = addDays(startDay.value, i);

    // Exclude dates from nextBaseDate onwards if limit is applied
    if (hasEndDateLimit.value && !isBefore(date, props.nextBaseDate)) {
      break;
    }

    dates.push({
      value: formatAsISODate(date),
      text: formatAsDisplayDate(date),
    });
  }
  return dates;
});

// Generate available end date options (after selected start date, with limit consideration)
const availableEndDates = computed(() => {
  if (!selectedStartDate.value) return [];

  const startDate = createDate(selectedStartDate.value);
  return availableDates.value.filter((date) => {
    const currentDate = createDate(date.value);

    // Must be on or after start date
    if (isBefore(currentDate, startDate)) return false;

    // Apply nextBaseDate limit
    if (hasEndDateLimit.value && !isBefore(currentDate, props.nextBaseDate)) {
      return false;
    }

    return true;
  });
});

// Check if export is possible
const canExport = computed(() => {
  return selectedStartDate.value && selectedEndDate.value;
});

// Reset dates to defaults when dependencies change
function resetToDefaults() {
  selectedStartDate.value = defaultStartDate.value;
  selectedEndDate.value = defaultEndDate.value;
}

// Watch for changes in dependencies and reset dates
watch(
  [() => props.baseDate, () => props.nextBaseDate, () => props.startPosition],
  () => {
    resetToDefaults();
  },
  { immediate: true },
);

// Handle start date change
function handleStartDateChange() {
  if (selectedEndDate.value) {
    const start = createDate(selectedStartDate.value);
    const end = createDate(selectedEndDate.value);

    // Reset end date if it's before start date or beyond limit
    if (!isAfter(end, start) && !isSameDay(end, start)) {
      selectedEndDate.value = "";
    } else if (hasEndDateLimit.value && !isBefore(end, props.nextBaseDate)) {
      selectedEndDate.value = "";
    }
  }
}

// Handle ICS export button click
function handleExportICS() {
  if (!canExport.value) return;

  try {
    exportICS(
      props.startPosition,
      createDate(props.baseDate),
      createDate(props.nextBaseDate),
      createDate(selectedStartDate.value),
      createDate(selectedEndDate.value),
    );

    emit("export-complete", { success: true });
  } catch (error) {
    emit("export-complete", { success: false, error });
  }
}
</script>

<style scoped>
.export-date-selectors {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.date-separator {
  color: var(--gray-600);
  font-weight: var(--font-weight-medium);
  padding: 0 var(--spacing-xs);
  white-space: nowrap;
}

.export-button {
  background-color: var(--success-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.export-button:hover:not(:disabled) {
  background-color: var(--success-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.export-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.date-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: var(--background-light);
  color: var(--text-color);
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.date-select:focus {
  border-color: var(--primary-light);
  outline: none;
  box-shadow: 0 0 0 3px rgba(72, 149, 239, 0.3);
}

.date-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
