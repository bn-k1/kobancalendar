<!-- src/components/ExportSection.vue -->
<template>
  <fieldset id="exportSection" class="control-group">
    <legend>エクスポート</legend>
    <div class="form-group">
      <label id="exportLabelPostBaseDate" v-if="isBaseDateInPast"
        >今日から</label
      >
      <label id="exportLabelPreBaseDate" v-else>基準日から</label>
      <select
        id="exportMonths"
        aria-label="エクスポート期間を選択"
        v-model="selectedMonths"
        @change="handleMonthsChange"
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
      </select>
      <span>ヶ月分</span>
      <button
        id="exportButton"
        aria-label="ICSをダウンロード"
        @click="handleExportICS"
      >
        ダウンロード
      </button>
    </div>
  </fieldset>
</template>

<script setup>
import { ref, computed } from "vue";
import { useIcsExport } from "@/composables/useIcsExport";
import { createDate, today, isBefore } from "@/utils/date";

const props = defineProps({
  baseDate: {
    type: [Date, Object],
    required: true,
  },
  lastBaseDate: {
    type: [Date, Object],
    required: true,
  },
  startPosition: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["export", "export-complete"]);

// State
const selectedMonths = ref(1);
const { exportICS } = useIcsExport();

// Computed
const isBaseDateInPast = computed(() => {
  const currentDay = today();
  const baseDateValue = createDate(props.baseDate);
  return baseDateValue ? isBefore(baseDateValue, currentDay) : false;
});

// Handle export months change
function handleMonthsChange() {
  emit("export", { months: parseInt(selectedMonths.value, 10) });
}

// Handle ICS export button click
function handleExportICS() {
  const months = parseInt(selectedMonths.value, 10);
  const position = props.startPosition;

  try {
    exportICS(
      months,
      position,
      createDate(props.baseDate),
      createDate(props.lastBaseDate),
    );
    emit("export-complete", { success: true });
  } catch (error) {
    console.error("ICS export error:", error);
    emit("export-complete", { success: false, error });
  }
}
</script>

<style scoped>
/* Export section specific styles */
.export-form-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.export-form-group select {
  width: auto;
  min-width: 60px;
  flex-shrink: 0;
}

.export-form-group button {
  margin-left: auto;
  white-space: nowrap;
  flex-shrink: 0;
  background-color: var(--success-color);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: 1rem;
}

.export-form-group button:hover {
  background-color: var(--success-color);
}
</style>
