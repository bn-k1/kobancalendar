<!-- src/components/ExportSection.vue -->
<template>
  <fieldset id="exportSection" class="control-group">
    <legend>エクスポート</legend>
    <div class="form-group">
      <label id="exportLabelPostBaseDate" v-if="isBaseDateInPast">今日から</label>
      <label id="exportLabelPreBaseDate" v-else>基準日から</label>
      <select
        id="exportMonths"
        aria-label="エクスポート期間を選択"
        v-model="selectedMonths"
        @change="handleMonthsChange"
      >
        <option value="1">1ヶ月分</option>
        <option value="2">2ヶ月分</option>
        <option value="3">3ヶ月分</option>
        <option value="4">4ヶ月分</option>
        <option value="5">5ヶ月分</option>
        <option value="6">6ヶ月分</option>
      </select>
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
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { useIcsExport } from '@/composables/useIcsExport';

const props = defineProps({
  baseDate: {
    type: [Date, Object],
    required: true
  },
  lastBaseDate: {
    type: [Date, Object],
    required: true
  },
  startPosition: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['export']);

// State
const selectedMonths = ref(1);
const { exportICS } = useIcsExport();

// Computed
const isBaseDateInPast = computed(() => {
  const today = dayjs().startOf('day');
  const baseDateValue = dayjs(props.baseDate);
  return baseDateValue ? baseDateValue.isBefore(today) : false;
});

// Handle export months change
function handleMonthsChange() {
  emit('export', { months: parseInt(selectedMonths.value, 10) });
}

// Handle ICS export button click
function handleExportICS() {
  const months = parseInt(selectedMonths.value, 10);
  const position = props.startPosition;
  
  try {
    exportICS(months, position, dayjs(props.baseDate), dayjs(props.lastBaseDate));
    emit('export-complete', { success: true });
  } catch (error) {
    console.error('ICS export error:', error);
    emit('export-complete', { success: false, error });
  }
}
</script>

<style scoped>
/* Reuse global styles from original app */
</style>