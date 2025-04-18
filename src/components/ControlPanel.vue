<template>
  <div class="controls">
    <fieldset id="baseDateSection" class="control-group" v-if="isLoaded">
      <legend>基準日</legend>
      <div class="form-group">
        <select
          id="baseDate"
          aria-label="基準日を選択"
          v-model="selectedBaseDate"
          @change="handleBaseDateChange"
        >
          <option
            v-for="date in baseDates"
            :key="date.format('YYYY-MM-DD')"
            :value="date.format('YYYY-MM-DD')"
          >
            {{ date.format("YYYY-MM-DD") }}
          </option>
        </select>
      </div>
    </fieldset>

    <fieldset id="startNumberSection" class="control-group" v-if="isLoaded">
      <legend>コマ位置</legend>
      <div class="form-group">
        <select
          id="startNumber"
          aria-label="コマ位置を選択"
          v-model="startPosition"
          @change="handlePositionChange"
        >
          <option v-for="i in rotationCycleLength" :key="i" :value="i">
            {{ i }}
          </option>
        </select>
      </div>
    </fieldset>

    <slot></slot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import { useScheduleStore } from "@/stores/schedule";
import { useCalendarStore } from "@/stores/calendar";
import { updateURLParams } from "@/utils/params-utils";

// プロップス
const props = defineProps({
  isLoaded: {
    type: Boolean,
    default: false,
  },
});

// エミット
const emit = defineEmits(["change"]);

// ストア
const scheduleStore = useScheduleStore();
const { baseDates, currentBaseDate } = storeToRefs(scheduleStore);
const calendarStore = useCalendarStore();
const { startPosition } = storeToRefs(calendarStore);

// ローカル状態
const selectedBaseDate = ref("");
const rotationCycleLength = computed(() => {
  return scheduleStore.scheduleData.rotationCycleLength;
});

// 基準日変更処理
function handleBaseDateChange() {
  const newBaseDate = dayjs(selectedBaseDate.value);
  scheduleStore.updateCurrentBaseDate(newBaseDate);
  updateURLParams({
    baseDate: selectedBaseDate.value,
  });
  emit("change", { type: "baseDate", value: newBaseDate });
}

// コマ位置変更処理
function handlePositionChange() {
  updateURLParams({
    startNumber: startPosition.value,
  });
  emit("change", { type: "position", value: startPosition.value });
}

// 初期化
onMounted(() => {
  if (currentBaseDate.value) {
    selectedBaseDate.value = currentBaseDate.value.format("YYYY-MM-DD");
  } else if (baseDates.value.length > 0) {
    selectedBaseDate.value = baseDates.value[0].format("YYYY-MM-DD");
  }
});
</script>

<style scoped>
/* コンポーネント固有のスタイル */
</style>
