<template>
  <fieldset id="exportSection" class="control-group" v-if="isLoaded">
    <legend>エクスポート</legend>
    <div class="form-group">
      <span id="exportLabelPostBaseDate" v-if="isBaseDateInPast">今日から</span>
      <span id="exportLabelPreBaseDate" v-else>基準日から</span>
      <select
        id="exportMonths"
        aria-label="エクスポート期間を選択"
        v-model="exportMonths"
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="12">12</option>
        <option value="24">24</option>
      </select>
      <span> ヶ月分のデータを</span>
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

<style scoped>
/* コンポーネント固有のスタイル */
</style>
