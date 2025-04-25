<!-- src/components/Controls/BaseDateSelector.vue -->
<template>
  <fieldset id="baseDateSection" class="control-group">
    <legend>基準日</legend>
    <div class="form-group">
      <!-- Display base date as text if only one date is available -->
      <span v-if="availableDates.length === 1">
        {{ formattedCurrentDate }}
      </span>

      <!-- Display dropdown if multiple dates are available -->
      <select
        v-else
        id="baseDate"
        aria-label="基準日を選択"
        :value="formattedValue"
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
import { 
  createDate, 
  formatAsISODate, 
  formatAsDisplayDate 
} from '@/utils/date';

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
const currentDate = computed(() => createDate(props.modelValue));

// Computed formatted values
const formattedValue = computed(() => formatAsISODate(currentDate.value));
const formattedCurrentDate = computed(() => formatAsDisplayDate(currentDate.value));

// Handle date selection change
function handleChange(event) {
  const newDate = createDate(event.target.value);
  emit('update:modelValue', newDate);
  emit('change', newDate);
}
</script>

<style scoped>
/* Reuse global styles from original app */
</style>