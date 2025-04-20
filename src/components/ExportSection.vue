<template>
  <fieldset id="exportSection" class="control-group" v-if="isLoaded">
    <legend>エクスポート</legend>
    <div class="form-group">
      <label id="exportLabelPostBaseDate" v-if="isBaseDateInPast"
        >今日から</label
      >
      <label id="exportLabelPreBaseDate" v-else>基準日から</label>
      <select
        id="exportMonths"
        aria-label="エクスポート期間を選択"
        v-model="exportMonths"
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
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import { useScheduleStore } from "@/stores/schedule";
import { useCalendarStore } from "@/stores/calendar";
import { exportICS } from "@/services/export-service";
import { isBaseDateInPast as checkBaseDateInPast } from "@/utils/date-utils";
import { ERROR_MESSAGES } from "@/config/constants";

// プロップス
const props = defineProps({
  isLoaded: {
    type: Boolean,
    default: false,
  },
});

// ストア
const scheduleStore = useScheduleStore();
const { currentBaseDate, lastBaseDate } = storeToRefs(scheduleStore);
const calendarStore = useCalendarStore();
const { startPosition } = storeToRefs(calendarStore);

// ローカル状態
const exportMonths = ref(1); // デフォルトは1ヶ月

// 基準日が過去かどうか
const isBaseDateInPast = computed(() => {
  return checkBaseDateInPast(currentBaseDate.value);
});

// ICSエクスポート処理
function handleExportICS() {
  const months = parseInt(exportMonths.value);
  const position = parseInt(startPosition.value);

  try {
    exportICS(months, position, currentBaseDate.value, lastBaseDate.value);
  } catch (error) {
    console.error(ERROR_MESSAGES.ICS_EXPORT_ERROR, error);
    alert(ERROR_MESSAGES.ICS_EXPORT_ERROR);
  }
}
</script>
