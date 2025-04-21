<!-- src/components/Controls/BaseDateSelector.vue -->
<template>
  <fieldset id="baseDateSection" class="control-group">
    <legend>基準日</legend>
    <div class="form-group">
      <!-- Display base date as text if only one date is available -->
      <span v-if="availableDates.length === 1">
        {{ formatAsDisplayDate(currentDate) }}
      </span>

      <!-- Display dropdown if multiple dates are available -->
      <select
        v-else
        id="baseDate"
        aria-label="基準日を選択"
        :value="formatAsISODate(currentDate)"
        @change="handleChange"
      >
        <option
          v-for="date in availableDates"
          :key="formatAsISODate(date)"
          :value="formatAsISODate(date)"
        >
          {{ formatAsDisplayDate(date) }}
        </option>
      </select>
    </div>
  </fieldset>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import { formatAsISODate, formatAsDisplayDate } from '@/utils/date-formatters';
import { DATE_FORMATS } from '@/config/constants';

const props = defineProps({
  modelValue: {
    type: [Date, Object, String],
    required: true
  },
  availableDates: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Convert modelValue to dayjs object for internal use
const currentDate = computed(() => {
  if (typeof props.modelValue === 'string') {
    return dayjs(props.modelValue);
  }
  return dayjs(props.modelValue);
});

// Handle date selection change
function handleChange(event) {
  const newDate = dayjs(event.target.value);
  emit('update:modelValue', newDate);
  emit('change', newDate);
}
</script>

<style scoped>
/* Reuse global styles from original app */
</style>
