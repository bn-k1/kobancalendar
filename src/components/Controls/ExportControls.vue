<!-- src/components/Controls/ExportControls.vue -->
<template>
  <fieldset id="exportSection" class="control-group export-section">
    <legend>{{ EXPORT_CONFIG.LEGEND }}</legend>
    <div class="export-controls">
      <div class="date-range-controls">
        <div class="form-group">
          <label for="exportStartDate">{{ EXPORT_CONFIG.START_DATE_LABEL }}</label>
          <select
            id="exportStartDate"
            v-model="startDate"
            :aria-label="EXPORT_CONFIG.START_DATE_ARIA"
          >
            <option
              v-for="date in startDateOptions"
              :key="date.value"
              :value="date.value"
            >
              {{ date.text }}
            </option>
          </select>
        </div>
        
        <span class="date-separator">{{ EXPORT_CONFIG.DATE_SEPARATOR }}</span>
        
        <div class="form-group">
          <label for="exportEndDate">{{ EXPORT_CONFIG.END_DATE_LABEL }}</label>
          <select
            id="exportEndDate"
            v-model="endDate"
            :aria-label="EXPORT_CONFIG.END_DATE_ARIA"
          >
            <option
              v-for="date in endDateOptions"
              :key="date.value"
              :value="date.value"
              :disabled="date.disabled"
            >
              {{ date.text }}
            </option>
          </select>
        </div>
      </div>
      
      <button
        class="primary-btn export-btn"
        @click="handleExport"
        :disabled="!isValidDateRange"
      >
        {{ EXPORT_CONFIG.BUTTON_TEXT }}
      </button>
    </div>
  </fieldset>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCalendar } from '@/composables/useCalendar';
import { useSchedule } from '@/composables/useSchedule';
import { useExport } from '@/composables/useExport';
import {
  createDate,
  formatAsISODate,
  formatAsDisplayDate,
  today,
  addDays,
  addMonths,
  isBefore,
  isAfter,
  isSameDay,
} from '@/utils/date';
import { EXPORT_CONFIG } from '@/utils/constants';

const props = defineProps({
  startPosition: {
    type: Number,
    required: true,
  },
});

// Composables
const { generateCalendarEvents } = useCalendar();
const { nextBaseDate } = useSchedule();
const { exportToICS } = useExport();

// Local state
const startDate = ref('');
const endDate = ref('');

// Generate date options for start date dropdown
const startDateOptions = computed(() => {
  const options = [];
  const todayDate = today();
  const maxDate = addMonths(todayDate, 3);
  
  let currentDate = todayDate;
  while (!isAfter(currentDate, maxDate)) {
    options.push({
      value: formatAsISODate(currentDate),
      text: formatAsDisplayDate(currentDate),
    });
    currentDate = addDays(currentDate, 1);
  }
  
  return options;
});

// Generate date options for end date dropdown
const endDateOptions = computed(() => {
  const options = [];
  const todayDate = today();
  const selectedStartDate = startDate.value ? createDate(startDate.value) : todayDate;
  
  // Determine max date
  let maxDate = addMonths(todayDate, 3);
  if (nextBaseDate.value && nextBaseDate.value.isValid()) {
    const dayBeforeNext = addDays(nextBaseDate.value, -1);
    if (isBefore(dayBeforeNext, maxDate)) {
      maxDate = dayBeforeNext;
    }
  }
  
  let currentDate = selectedStartDate;
  while (!isAfter(currentDate, maxDate)) {
    options.push({
      value: formatAsISODate(currentDate),
      text: formatAsDisplayDate(currentDate),
      disabled: isBefore(currentDate, selectedStartDate),
    });
    currentDate = addDays(currentDate, 1);
  }
  
  return options;
});

// Check if date range is valid
const isValidDateRange = computed(() => {
  if (!startDate.value || !endDate.value) return false;
  
  const start = createDate(startDate.value);
  const end = createDate(endDate.value);
  
  return !isAfter(start, end);
});

// Handle export
async function handleExport() {
  if (!isValidDateRange.value) return;
  
  const start = createDate(startDate.value);
  const end = addDays(createDate(endDate.value), 1); // Include end date
  
  // Generate events for the selected range
  const events = generateCalendarEvents(start, end);
  
  // Export to ICS
  await exportToICS(events, start, end);
}

// Initialize dates
function initializeDates() {
  const todayDate = today();
  startDate.value = formatAsISODate(todayDate);
  
  // Set default end date to 1 month from today
  const defaultEndDate = addMonths(todayDate, 1);
  const maxEndDate = nextBaseDate.value && nextBaseDate.value.isValid() 
    ? addDays(nextBaseDate.value, -1)
    : addMonths(todayDate, 3);
    
  endDate.value = formatAsISODate(
    isBefore(defaultEndDate, maxEndDate) ? defaultEndDate : maxEndDate
  );
}

// Watch for start date changes to adjust end date if needed
watch(startDate, (newStartDate) => {
  if (newStartDate && endDate.value) {
    const start = createDate(newStartDate);
    const end = createDate(endDate.value);
    
    if (isBefore(end, start)) {
      endDate.value = newStartDate;
    }
  }
});

// Initialize on mount
initializeDates();
</script>

<style scoped>
.export-section {
  margin-top: var(--spacing-lg);
  max-width: none;
  width: 100%;
}

.export-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.date-range-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.date-separator {
  color: var(--gray-600);
  font-weight: var(--font-weight-medium);
  padding: 0 var(--spacing-xs);
}

.export-btn {
  align-self: flex-start;
  min-width: 140px;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media screen and (max-width: 768px) {
  .date-range-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-separator {
    display: none;
  }
  
  .export-btn {
    width: 100%;
  }
}
</style>