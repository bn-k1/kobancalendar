<!-- src/components/Controls/BaseSelector.vue -->
<template>
  <fieldset :id="id" class="control-group">
    <legend>{{ legend }}</legend>
    <div class="form-group">
      <span v-if="displayAsText || options.length === 1">
        {{
          displayValue ||
          (options.length === 1 && formatter
            ? formatter(options[0].value || options[0])
            : formatOption(options[0]))
        }}
      </span>

      <select
        v-else
        :id="id"
        :aria-label="ariaLabel"
        :value="modelValue"
        @change="handleChange"
      >
        <option value="" disabled selected v-if="!modelValue">
          コマ位置を選択
        </option>
        <option
          v-for="option in options"
          :key="option.value || option"
          :value="option.value || option"
          :disabled="option.disabled"
        >
          {{ option.text || formatOption(option) }}
        </option>
      </select>

      <slot></slot>
    </div>
    
    <div v-if="displayScheduleUpdateNotice" class="schedule-update-notice">
      交番表更新: {{ scheduleUpdateNotice }}~{{ isScheduleApplied ? '(適用済)' : '' }}
    </div>
  </fieldset>
</template>

<script setup>
import { computed } from 'vue';
import { useSchedule } from '@/composables/useSchedule';

const props = defineProps({
  id: {
    type: String,
    default: "baseSelector",
  },
  legend: {
    type: String,
    required: true,
  },
  ariaLabel: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String, Number, Date, Object],
    required: false,
  },
  options: {
    type: Array,
    default: () => [],
  },
  displayValue: {
    type: String,
    default: "",
  },
  displayAsText: {
    type: Boolean,
    default: false,
  },
  formatter: {
    type: Function,
  },
  scheduleUpdateNotice: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

// Get schedule composable to check next schedule data
const { scheduleDataSets } = useSchedule();

// Check if schedule update notice should be displayed
const displayScheduleUpdateNotice = computed(() => {
  return props.scheduleUpdateNotice && props.scheduleUpdateNotice.trim() !== "";
});

// Check if next schedule is applied (both conditions must be met)
const isScheduleApplied = computed(() => {
  if (!props.scheduleUpdateNotice) return false;
  
  // Check if next schedule data exists and has valid rotation cycle length
  const nextData = scheduleDataSets.value?.next;
  return nextData && nextData.rotationCycleLength > 0;
});

// Format option for display
function formatOption(option) {
  if (props.formatter) {
    return props.formatter(option);
  }

  // Default formatting for different types
  if (!option) {
    return "";
  }

  if (typeof option === "object") {
    return option.toString ? option.toString() : JSON.stringify(option);
  }

  return String(option);
}

// Handle selection change
function handleChange(event) {
  const newValue = event.target.value;
  emit("update:modelValue", newValue);
  emit("change", newValue);
}
</script>

<style scoped>
.schedule-update-notice {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
}
</style>