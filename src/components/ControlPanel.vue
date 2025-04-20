// src/components/ControlPanel.vue
<template>
  <div class="controls">
    <fieldset id="baseDateSection" class="control-group" v-if="isLoaded">
      <legend>基準日</legend>
      <div class="form-group">
        <!-- 基準日が単一の場合はテキスト表示 -->
        <span v-if="baseDates.length === 1">
          {{ selectedBaseDate }}
        </span>
        
        <!-- 複数の基準日がある場合はドロップダウン表示 -->
        <select
          v-else
          id="baseDate"
          aria-label="基準日を選択"
          v-model="selectedBaseDate"
          @change="handleBaseDateChange"
        >
          <option
            v-for="date in baseDates"
            :key="date.format(DATE_FORMATS.ISO_DATE)"
            :value="date.format(DATE_FORMATS.ISO_DATE)"
          >
            {{ date.format(DATE_FORMATS.ISO_DATE) }}
          </option>
        </select>
      </div>
    </fieldset>

    <fieldset id="startNumberSection" class="control-group" v-if="isLoaded">
      <legend>{{ selectedBaseDate }}のコマ位置</legend>
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
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import { useScheduleStore } from "@/stores/schedule";
import { useCalendarStore } from "@/stores/calendar";
import {
  updateURLParams,
  getURLParam,
  getNumberParam,
} from "@/utils/params-utils";
import { DATE_FORMATS } from "@/config/constants";

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

// コンポーネントが作成されたときに selectedBaseDate を初期化
if (currentBaseDate.value) {
  selectedBaseDate.value = currentBaseDate.value.format(DATE_FORMATS.ISO_DATE);
} else if (baseDates.value && baseDates.value.length > 0) {
  selectedBaseDate.value = baseDates.value[0].format(DATE_FORMATS.ISO_DATE);
}

const rotationCycleLength = computed(() => {
  return scheduleStore.scheduleData.rotationCycleLength;
});

// 基準日変更処理
function handleBaseDateChange() {
  // 基準日が1つだけの場合は何もしない
  if (baseDates.value.length <= 1) return;
  
  const newBaseDate = dayjs(selectedBaseDate.value);
  scheduleStore.updateCurrentBaseDate(newBaseDate);

  // 全ての選択情報を含めてURLを更新
  updateAllURLParams();

  emit("change", { type: "baseDate", value: newBaseDate });
}

// コマ位置変更処理
function handlePositionChange() {
  // 全ての選択情報を含めてURLを更新
  updateAllURLParams();

  emit("change", { type: "position", value: startPosition.value });
}

// 全ての選択情報を含めてURLを更新する関数
function updateAllURLParams() {
  updateURLParams({
    baseDate: selectedBaseDate.value,
    startNumber: startPosition.value,
  });
}

// currentBaseDate の変更を監視して selectedBaseDate を更新
watch(currentBaseDate, (newBaseDate) => {
  if (newBaseDate) {
    selectedBaseDate.value = newBaseDate.format(DATE_FORMATS.ISO_DATE);
  }
});

// baseDates の変更を監視（配列の最初の要素を selectedBaseDate に設定）
watch(baseDates, (newBaseDates) => {
  if (newBaseDates && newBaseDates.length > 0 && !selectedBaseDate.value) {
    selectedBaseDate.value = newBaseDates[0].format(DATE_FORMATS.ISO_DATE);
  }
});

// 初期化
onMounted(() => {
  // URLからパラメータを取得
  const baseDateParam = getURLParam("baseDate", "");
  const startNumberParam = getNumberParam("startNumber", null);

  // 基準日が1つだけの場合、URLのパラメータは無視して常に使用する
  if (baseDates.value.length === 1) {
    selectedBaseDate.value = baseDates.value[0].format(DATE_FORMATS.ISO_DATE);
    scheduleStore.updateCurrentBaseDate(baseDates.value[0]);
  } 
  // 複数の基準日がある場合はURLパラメータを適用
  else if (baseDateParam) {
    const dateObj = dayjs(baseDateParam);
    if (dateObj.isValid()) {
      // 有効な日付の場合はselectedBaseDateを更新
      selectedBaseDate.value = dateObj.format(DATE_FORMATS.ISO_DATE);
    }
  }

  if (
    startNumberParam !== null &&
    rotationCycleLength.value >= startNumberParam &&
    startNumberParam > 0
  ) {
    // 有効なコマ位置の場合はstartPositionを更新
    calendarStore.setStartPosition(startNumberParam);
  }

  // onMounted でも再確認
  if (currentBaseDate.value) {
    selectedBaseDate.value = currentBaseDate.value.format(
      DATE_FORMATS.ISO_DATE,
    );
  } else if (baseDates.value.length > 0) {
    selectedBaseDate.value = baseDates.value[0].format(DATE_FORMATS.ISO_DATE);
  }
});
</script>