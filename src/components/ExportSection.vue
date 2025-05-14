<!-- src/components/ExportSection.vue -->
<template>
  <fieldset id="exportSection" class="control-group">
    <legend>エクスポート</legend>
    <div class="form-group">
      <label id="exportLabel"
        >{{ formatStartDate(isBaseDateInPast ? today() : baseDate) }}から</label
      >
      <select
        id="exportMonths"
        aria-label="エクスポート期間を選択"
        v-model="selectedMonths"
        @change="handleMonthsChange"
      >
        <option
          v-for="option in PERIODOPTIONS"
          :key="option.value"
          :value="parseInt(option.value) / 30"
        >
          {{ option.text.replace("ヶ月", "") }}
        </option>
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
import { APP_CONFIG, PERIODOPTIONS } from "@/utils/constants";

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
const selectedMonths = ref(APP_CONFIG.DEFAULT_EXPORT_MONTHS);
const { exportICS } = useIcsExport();

// Computed
const isBaseDateInPast = computed(() => {
  const currentDay = today();
  const baseDateValue = createDate(props.baseDate);
  return baseDateValue ? isBefore(baseDateValue, currentDay) : false;
});

function formatStartDate(date) {
  return `${createDate(date).format("M")}/${APP_CONFIG.DEFAULT_EXPORTDAY}`;
}

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
      createDate(props.nextBaseDate),
    );
    emit("export-complete", { success: true });
  } catch (error) {
    emit("export-complete", { success: false, error });
  }
}
</script>
