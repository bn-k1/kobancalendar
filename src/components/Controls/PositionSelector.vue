<!-- src/components/Controls/PositionSelector.vue -->
<template>
  <fieldset :id="id" class="control-group">
    <legend>{{ legend }}</legend>
    <div class="form-group">
      <!-- Display as text when only one option or explicitly set to display as text -->
      <span v-if="displayAsText || options.length === 1">
        {{
          displayValue ||
          (options.length === 1 && formatter
            ? formatter(options[0].value || options[0])
            : formatOption(options[0]))
        }}
      </span>

      <!-- Display as select dropdown for multiple options -->
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
    
    <!-- Home screen addition notice (similar to schedule update notice) -->
    <div v-if="showHomeScreenNotice" class="home-screen-notice">
      この内容で「ホーム画面に追加」する場合は、一度上から下に引っ張ってリロードしてください
    </div>
  </fieldset>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

/**
 * PositionSelector Component
 * A specialized selector component for choosing position numbers in the rotation
 * Extends the functionality of BaseSelector with position-specific behavior
 * Includes home screen addition notice when position is selected
 */

// Define component props
const props = defineProps({
  id: {
    type: String,
    default: "positionSelector",
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
  showHomeScreenNotice: {
    type: Boolean,
    default: false,
  },
});

// Local state for tracking if user has made a selection
const hasUserSelection = ref(false);

// Define component emits
const emit = defineEmits(["update:modelValue", "change"]);

/**
 * Determine if home screen notice should be displayed
 * Shows notice when user has made a selection and showHomeScreenNotice prop is true
 */
const showHomeScreenNotice = computed(() => {
  return props.showHomeScreenNotice && hasUserSelection.value && props.modelValue;
});

/**
 * Format option for display
 * Uses custom formatter if provided, otherwise defaults to string conversion
 */
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

/**
 * Handle selection change event
 * Emits both update:modelValue and change events
 * Marks that user has made a selection for notice display
 */
function handleChange(event) {
  const newValue = event.target.value;
  hasUserSelection.value = true; // Mark that user has made a selection
  emit("update:modelValue", newValue);
  emit("change", newValue);
}

/**
 * Watch for external changes to modelValue
 * Reset user selection flag when value is cleared externally
 */
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    hasUserSelection.value = false;
  }
});
</script>

<style scoped>
/* Home screen notice styling (similar to schedule update notice) */
.home-screen-notice {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
}
</style>
