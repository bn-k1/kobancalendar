// src/views/HomeView.vue
<template>
  <UnifiedPageLayout layout="calendar">
    <!-- Controls section -->
    <template #controls>
      <div class="horizontal-fields" v-if="isLoaded && selectedBaseDate">
        <BaseSelector
          id="baseDate"
          legend="基準日"
          aria-label="基準日を選択"
          v-model="selectedBaseDate"
          :display-as-text="true"
          :display-value="activeBaseDate ? formatAsDisplayDate(activeBaseDate) : ''"
          :options="[]"
          :schedule-update-notice="scheduleUpdateNotice"
        >
          <div v-if="nextBaseDateStr && selectedBaseDate !== nextBaseDateStr" class="version-link-row">
            <button class="version-btn" @click="switchToNextBaseDate">
              新版: {{ formatAsDisplayDate(nextBaseDate) }}~
            </button>
          </div>
          <div v-else-if="nextBaseDateStr && defaultBaseDate" class="version-link-row">
            <button class="version-btn" @click="switchToDefaultBaseDate">
              旧版: {{ formatAsDisplayDate(defaultBaseDate) }}~
            </button>
          </div>
        </BaseSelector>

        <BaseSelector
          id="startNumber"
          legend="基準日のコマ位置"
          aria-label="コマ位置を選択"
          v-model="startPosition"
          :options="positionOptions"
          :show-home-screen-notice="true"
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
import { useAlertModalStore } from "@/stores/alertModal";

import defaultScheduleData from "@data/default/default.json";
import nextScheduleData from "@data/next/next.json";
import eventConfig from "@config/event.json";
import config from "@config/config.json";

const {
  hasLegacyUrlParams,
  readLegacyUrlParams,
  clearUrl,
  calculateNewPosition,
} = useUrlParams();
const {
  saveCalendarSelection,
  loadCalendarSelection,
  loadCalendarPositionFor,
  clearCalendarSelection,
} = useLocalParams();
const { isLoaded, initializeApp } = useAppInitializer();
const { initEditedSchedules } = useEditedSchedules();
const {
  open: openAlertModal,
  setSuggestedNumberHandler,
  clearSuggestedNumberHandler,
} = useAlertModalStore();
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
  scheduleUpdateNotice,
} = useSchedule();

const nextBaseDateStr = computed(() => {
  if (!nextBaseDate.value?.isValid?.()) return null;
  if (!defaultBaseDate.value?.isValid?.()) return null;
  if (formatAsISODate(nextBaseDate.value) === formatAsISODate(defaultBaseDate.value)) return null;
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

function switchBaseDate(dateObj, dateStr) {
  updateActiveBaseDate(dateObj);
  selectedBaseDate.value = dateStr;
  const restored = loadCalendarPositionFor(dateStr);
  const num = Number.isInteger(restored) ? restored : undefined;
  startPosition.value = num;
  setStartPosition(num);
  saveCalendarSelection(dateStr, num ?? null);
  navigateCalendarTo(dateObj);
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

function applySuggestedStartNumber(suggestedStartNumber) {
  if (
    !Number.isInteger(suggestedStartNumber) ||
    suggestedStartNumber < 1 ||
    suggestedStartNumber > rotationCycleLength.value
  ) {
    return;
  }

  startPosition.value = suggestedStartNumber;
  setStartPosition(suggestedStartNumber);

  if (selectedBaseDate.value) {
    saveCalendarSelection(selectedBaseDate.value, suggestedStartNumber);
  }

  if (viewRange.value.start && viewRange.value.end) {
    generateCalendarEvents(viewRange.value.start, viewRange.value.end);
  }
}

function classifyBaseDate(baseDateStr, validBaseDates) {
  if (!baseDateStr) return { kind: "empty" };
  const dateObj = createDate(baseDateStr);
  if (!dateObj.isValid()) return { kind: "invalid" };

  if (validBaseDates.some((d) => d && isSameDay(d, dateObj))) {
    return { kind: "active", baseDate: dateObj };
  }

  const oldBaseDate = createDate(config.old_base_date);
  if (oldBaseDate.isValid() && isSameDay(dateObj, oldBaseDate)) {
    return { kind: "migrate" };
  }

  return { kind: "unknown" };
}

function validStartNumberOrNull(raw, cycleLength) {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1 || n > cycleLength) return null;
  return n;
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

function openMigrationModal(suggestedNumber) {
  openAlertModal({
    title: "基準日を更新しました",
    message: ERROR_MESSAGES.INVALID_BASE_DATE,
    suggestedNumber,
  });
}

async function initialize() {
  const hadUrlParams = hasLegacyUrlParams();
  const legacyParams = hadUrlParams ? readLegacyUrlParams() : null;
  if (hadUrlParams) clearUrl();

  try {
    const result = await initializeApp({
      defaultScheduleData,
      nextScheduleData,
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
    const cycleLength = result.scheduleData.rotationCycleLength;

    const applied = legacyParams
      ? applyFromLegacy(legacyParams, validBaseDates, cycleLength)
      : applyFromStorage(validBaseDates, cycleLength);

    if (!applied) {
      return applyDefaultBaseDate();
    }
    return true;
  } catch (error) {
    console.error(ERROR_MESSAGES.INIT_FAILED, error);
    alert(ERROR_MESSAGES.INIT_FAILED);
    return false;
  }
}

function applyFromLegacy(params, validBaseDates, cycleLength) {
  const cls = classifyBaseDate(params.baseDate, validBaseDates);

  if (cls.kind === "empty") {
    // Legacy URL had other params but no baseDate
    alert(ERROR_MESSAGES.NO_BASE_DATE);
    return false;
  }
  if (cls.kind === "invalid") {
    console.error(`${ERROR_MESSAGES.INVALID_URL_PARAM}: baseDate`);
    return false;
  }

  if (cls.kind === "active") {
    const num = validStartNumberOrNull(params.startNumber, cycleLength);
    updateActiveBaseDate(cls.baseDate);
    selectedBaseDate.value = formatAsISODate(cls.baseDate);
    setStartPosition(num ?? undefined);
    startPosition.value = num ?? undefined;
    saveCalendarSelection(selectedBaseDate.value, num);
    return true;
  }

  if (cls.kind === "migrate") {
    const originalNum = parseInt(params.startNumber, 10);
    if (!isNaN(originalNum)) {
      const shifted = calculateNewPosition(
        originalNum,
        config.position_shift,
        cycleLength,
      );
      if (Number.isInteger(shifted)) {
        openMigrationModal(shifted);
      }
    }
    return false;
  }

  return false; // unknown
}

function applyFromStorage(validBaseDates, cycleLength) {
  const stored = loadCalendarSelection();
  if (!stored) return false;

  const cls = classifyBaseDate(stored.baseDate, validBaseDates);

  if (cls.kind === "active") {
    const num = validStartNumberOrNull(stored.startNumber, cycleLength);
    updateActiveBaseDate(cls.baseDate);
    selectedBaseDate.value = formatAsISODate(cls.baseDate);
    setStartPosition(num ?? undefined);
    startPosition.value = num ?? undefined;
    return true;
  }

  if (cls.kind === "migrate") {
    clearCalendarSelection();
    const originalNum = parseInt(stored.startNumber, 10);
    if (!isNaN(originalNum)) {
      const shifted = calculateNewPosition(
        originalNum,
        config.position_shift,
        cycleLength,
      );
      if (Number.isInteger(shifted)) {
        openMigrationModal(shifted);
      }
    }
    return false;
  }

  // invalid / empty / unknown — drop it
  clearCalendarSelection();
  return false;
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

onMounted(async () => {
  setSuggestedNumberHandler(applySuggestedStartNumber);
  await initialize();
});

onUnmounted(() => {
  clearSuggestedNumberHandler();
});
</script>

<style scoped>
.version-link-row {
  flex-basis: 100%;
  margin-top: var(--spacing-xs);
}
.version-btn {
  font-size: 0.88rem;
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.version-btn:hover {
  background: var(--primary-color);
  color: var(--text-light);
}

.loading-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-100);
  border-radius: var(--border-radius-lg);
  font-size: 1.2rem;
  color: var(--gray-600);
}
</style>
