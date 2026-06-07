// src/views/HomeView.vue
<template>
  <UnifiedPageLayout layout="calendar" @title-click="switchToDefaultBaseDate">
    <!-- Controls section -->
    <template #controls>
      <div v-if="isLoaded && selectedBaseDate" class="horizontal-fields">
        <BaseSelector
          id="baseDate"
          v-model="selectedBaseDate"
          legend="基準日"
          aria-label="基準日を選択"
          :display-as-text="true"
          :display-value="
            activeBaseDate ? formatAsDisplayDate(activeBaseDate) : ''
          "
          :options="[]"
        >
          <div
            v-if="nextBaseDateStr && selectedBaseDate !== nextBaseDateStr"
            class="version-link-row"
          >
            <button class="version-btn" @click="switchToNextBaseDate">
              新版: {{ formatAsDisplayDate(nextBaseDate) }}~
            </button>
          </div>
          <div
            v-else-if="nextBaseDateStr && defaultBaseDate"
            class="version-link-row"
          >
            <button class="version-btn" @click="switchToDefaultBaseDate">
              旧版: {{ formatAsDisplayDate(defaultBaseDate) }}~
            </button>
          </div>
        </BaseSelector>

        <BaseSelector
          id="startNumber"
          v-model="startPosition"
          legend="基準日のコマ位置"
          aria-label="コマ位置を選択"
          :options="positionOptions"
          @change="handlePositionChange"
        />
      </div>
    </template>

    <!-- Calendar section -->
    <template #calendar>
      <Suspense>
        <CalendarView
          ref="calendarRef"
          :initial-date="initialDate"
          :start-position="startPosition"
          :events="calendarEvents"
          @dates-set="handleDatesSet"
          @schedule-edited="handleEditedChanged"
        />
        <template #fallback>
          <div class="loading-placeholder">Loading...</div>
        </template>
      </Suspense>
    </template>

    <!-- Search section -->
    <template #search>
      <Suspense v-if="isLoaded">
        <EditedSchedulesList @edited-changed="handleEditedChanged" />
        <template #fallback>
          <div class="loading-placeholder">Loading...</div>
        </template>
      </Suspense>

      <Suspense v-if="isLoaded">
        <SearchSection />
        <template #fallback>
          <div class="loading-placeholder">Loading...</div>
        </template>
      </Suspense>
    </template>
  </UnifiedPageLayout>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  defineAsyncComponent,
} from "vue";

import UnifiedPageLayout from "@/layouts/UnifiedPageLayout.vue";
import BaseSelector from "@/components/Controls/BaseSelector.vue";

const CalendarView = defineAsyncComponent(
  () => import("@/components/CalendarView.vue"),
);
const SearchSection = defineAsyncComponent(
  () => import("@/components/SearchSection.vue"),
);
const EditedSchedulesList = defineAsyncComponent(
  () => import("@/components/EditedSchedulesList.vue"),
);

import { useCalendar } from "@/composables/useCalendar";
import { useEditedSchedules } from "@/stores/editedSchedules";
import { useSchedule } from "@/composables/useSchedule";
import { useAppInitializer } from "@/composables/useAppInitializer";
import { useUrlParams } from "@/composables/useUrlParams";
import { useLocalParams } from "@/composables/useLocalParams";

import {
  createDate,
  formatAsISODate,
  formatAsDisplayDate,
  today,
  isSameDay,
  isSameOrAfter,
  toDate,
} from "@/utils/date";

import { ERROR_MESSAGES } from "@/utils/constants";

import scheduleData from "@data/scheduleData.json";
import eventConfig from "@config/event.json";
import config from "@config/config.json";

const {
  readCanonicalCalendar,
  writeCalendarUrl,
  clearCalendarUrl,
  isCalendarRoute,
} = useUrlParams();
const {
  saveCalendarSelection,
  loadCalendarSelection,
  loadCalendarPositionFor,
  clearCalendarSelection,
} = useLocalParams();
const { isLoaded, initializeApp } = useAppInitializer();
const { initEditedSchedules } = useEditedSchedules();
const calendarRef = ref(undefined);
const selectedBaseDate = ref("");
const viewRange = ref({ start: null, end: null });

initEditedSchedules();

const {
  calendarEvents,
  startPosition: computedStartPosition,
  generateCalendarEvents,
  setStartPosition,
} = useCalendar();

const {
  defaultBaseDate,
  activeBaseDate,
  nextBaseDate,
  rotationCycleLength,
  updateActiveBaseDate,
} = useSchedule();

const nextBaseDateStr = computed(() => {
  if (!nextBaseDate.value?.isValid?.()) return null;
  if (!defaultBaseDate.value?.isValid?.()) return null;
  if (
    formatAsISODate(nextBaseDate.value) ===
    formatAsISODate(defaultBaseDate.value)
  )
    return null;
  return formatAsISODate(nextBaseDate.value);
});

const positionOptions = computed(() => {
  return Array.from({ length: rotationCycleLength.value }, (_, i) => ({
    value: i + 1,
    text: String(i + 1),
  }));
});

const initialDate = computed(() => {
  if (!activeBaseDate.value) return undefined;

  const currentDay = today();
  return isSameOrAfter(activeBaseDate.value, currentDay)
    ? toDate(activeBaseDate.value)
    : toDate(currentDay);
});

const startPosition = ref(undefined);

function navigateCalendarTo(dateObj) {
  if (isSameOrAfter(dateObj, today())) {
    calendarRef.value?.gotoDate(toDate(dateObj));
  } else {
    calendarRef.value?.gotoDate(toDate(today()));
  }
  if (viewRange.value.start && viewRange.value.end) {
    generateCalendarEvents(viewRange.value.start, viewRange.value.end);
  }
}

function isOldVersion() {
  if (!nextBaseDateStr.value) return false;
  if (!defaultBaseDate.value) return false;
  return selectedBaseDate.value === formatAsISODate(defaultBaseDate.value);
}

function syncCalendarUrl({ push = false } = {}) {
  if (!selectedBaseDate.value) {
    clearCalendarUrl();
    return;
  }
  const hasPosition = Number.isInteger(startPosition.value);
  writeCalendarUrl(
    {
      position: hasPosition ? startPosition.value : null,
      version: hasPosition && isOldVersion() ? "old" : null,
    },
    { push },
  );
}

function switchBaseDate(dateObj, dateStr) {
  updateActiveBaseDate(dateObj);
  selectedBaseDate.value = dateStr;
  const restored = loadCalendarPositionFor(dateStr);
  const num = Number.isInteger(restored) ? restored : undefined;
  startPosition.value = num;
  setStartPosition(num);
  saveCalendarSelection(dateStr, num ?? null);
  navigateCalendarTo(dateObj);
  // 版（新/旧）の切替もユーザー操作なので履歴に積み、「戻る」で復帰できるようにする。
  syncCalendarUrl({ push: true });
}

function switchToNextBaseDate() {
  switchBaseDate(createDate(nextBaseDateStr.value), nextBaseDateStr.value);
}

function switchToDefaultBaseDate() {
  if (!defaultBaseDate.value) return;
  switchBaseDate(defaultBaseDate.value, formatAsISODate(defaultBaseDate.value));
}

function handlePositionChange(newPosition) {
  const positionValue = parseInt(newPosition, 10);
  startPosition.value = positionValue;
  setStartPosition(positionValue);

  if (selectedBaseDate.value) {
    saveCalendarSelection(selectedBaseDate.value, positionValue);
    // 他人のコマ位置を覗いたとき履歴に積み、「戻る」で自分の表示へ復帰できるようにする。
    syncCalendarUrl({ push: true });
  }
}

function handleDatesSet({ start, end }) {
  viewRange.value = { start, end };
  generateCalendarEvents(start, end);
}

function handleEditedChanged() {
  if (viewRange.value.start && viewRange.value.end) {
    generateCalendarEvents(viewRange.value.start, viewRange.value.end);
  }
}

function validStartNumberOrNull(raw, cycleLength) {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1 || n > cycleLength) return null;
  return n;
}

function isValidBaseDate(baseDateStr, validBaseDates) {
  if (!baseDateStr) return null;
  const dateObj = createDate(baseDateStr);
  if (!dateObj.isValid()) return null;
  if (validBaseDates.some((d) => d && isSameDay(d, dateObj))) return dateObj;
  return null;
}

function applyDefaultBaseDate() {
  if (!defaultBaseDate.value) {
    console.error(ERROR_MESSAGES.NO_BASE_DATE);
    return false;
  }
  updateActiveBaseDate(defaultBaseDate.value);
  selectedBaseDate.value = formatAsISODate(defaultBaseDate.value);
  setStartPosition(undefined);
  startPosition.value = undefined;
  return true;
}

async function initialize() {
  try {
    const result = await initializeApp({
      scheduleData,
      config,
      eventConfig,
    });

    if (!result) {
      alert(ERROR_MESSAGES.INIT_FAILED);
      return false;
    }

    const validBaseDates = [defaultBaseDate.value, nextBaseDate.value].filter(
      Boolean,
    );
    const cycleLength = result.activeScheduleData.rotationCycleLength;

    let applied = applyFromCanonical(validBaseDates, cycleLength);
    if (!applied) applied = applyFromStorage(validBaseDates, cycleLength);
    if (!applied) applied = applyDefaultBaseDate();

    syncCalendarUrl();
    return applied;
  } catch (error) {
    console.error(ERROR_MESSAGES.INIT_FAILED, error);
    alert(ERROR_MESSAGES.INIT_FAILED);
    return false;
  }
}

function applyFromCanonical(validBaseDates, cycleLength, { navigate = false } = {}) {
  const { position, version } = readCanonicalCalendar();
  if (position == null && version == null) return false;

  let targetBaseDate = null;
  if (version === "old" && defaultBaseDate.value) {
    targetBaseDate = defaultBaseDate.value;
  } else if (nextBaseDate.value) {
    targetBaseDate = nextBaseDate.value;
  } else if (defaultBaseDate.value) {
    targetBaseDate = defaultBaseDate.value;
  }
  if (!targetBaseDate) return false;

  const isoBaseDate = formatAsISODate(targetBaseDate);
  const validUrlNum =
    position != null ? validStartNumberOrNull(position, cycleLength) : null;
  const fallbackNum = loadCalendarPositionFor(isoBaseDate);
  const num =
    validUrlNum ?? (Number.isInteger(fallbackNum) ? fallbackNum : null);

  updateActiveBaseDate(targetBaseDate);
  selectedBaseDate.value = isoBaseDate;
  setStartPosition(num ?? undefined);
  startPosition.value = num ?? undefined;
  if (Number.isInteger(num)) {
    saveCalendarSelection(isoBaseDate, num);
  }
  // popstate（戻る/進む）からの再適用ではカレンダーの表示位置も移動させる。
  if (navigate) {
    navigateCalendarTo(targetBaseDate);
  }
  return true;
}

function applyFromStorage(validBaseDates, cycleLength) {
  const stored = loadCalendarSelection();
  if (!stored) return false;

  const dateObj = isValidBaseDate(stored.baseDate, validBaseDates);
  if (!dateObj) {
    clearCalendarSelection();
    return false;
  }

  const num = validStartNumberOrNull(stored.startNumber, cycleLength);
  updateActiveBaseDate(dateObj);
  selectedBaseDate.value = formatAsISODate(dateObj);
  setStartPosition(num ?? undefined);
  startPosition.value = num ?? undefined;
  return true;
}

watch(activeBaseDate, (newBaseDate) => {
  if (newBaseDate) {
    selectedBaseDate.value = formatAsISODate(newBaseDate);
  }
});

watch(computedStartPosition, (newValue) => {
  if (newValue && newValue !== startPosition.value) {
    startPosition.value = newValue;
  }
});

// 「戻る」「進む」でURLが変わったとき、canonical URL を読み直してカレンダーへ反映する。
// URL writer は能動的な操作のみ pushState で履歴を積むので、ここで対の reader を用意する。
function handlePopState() {
  if (!isCalendarRoute()) return;
  const applied = applyFromCanonical([], rotationCycleLength.value, {
    navigate: true,
  });
  if (!applied) {
    // p も v も無いエントリ（コマ位置未選択の既定状態）へ戻った場合。
    if (applyDefaultBaseDate() && defaultBaseDate.value) {
      navigateCalendarTo(defaultBaseDate.value);
    }
  }
}

onMounted(async () => {
  await initialize();
  window.addEventListener("popstate", handlePopState);
});

onUnmounted(() => {
  window.removeEventListener("popstate", handlePopState);
});
</script>

<style scoped>
.loading-placeholder {
  min-height: 400px;
}
</style>
