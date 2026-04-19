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

import {
  createDate,
  formatAsISODate,
  formatAsDisplayDate,
  today,
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
  getDateParam,
  getNumberParam,
  updateCalendarParams,
  pushURLParams,
  resetURLIfUnknownParams,
  enforceValidBaseDate,
} = useUrlParams();
const { isLoaded, initializeApp } = useAppInitializer();
const { initEditedSchedules } = useEditedSchedules();
const { setSuggestedNumberHandler, clearSuggestedNumberHandler } =
  useAlertModalStore();
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

function switchToNextBaseDate() {
  const nextDateObj = createDate(nextBaseDateStr.value);
  updateActiveBaseDate(nextDateObj);
  selectedBaseDate.value = nextBaseDateStr.value;
  startPosition.value = undefined;
  setStartPosition(undefined);
  pushURLParams({ baseDate: nextBaseDateStr.value, startNumber: undefined });
  navigateCalendarTo(nextDateObj);
}

function handlePopstate() {
  const params = new URLSearchParams(window.location.search);
  const baseDateStr = params.get("baseDate");
  const startNumberStr = params.get("startNumber");

  const dateObj = baseDateStr ? createDate(baseDateStr) : null;
  const baseToApply = dateObj?.isValid() ? dateObj : defaultBaseDate.value;
  updateActiveBaseDate(baseToApply);
  selectedBaseDate.value = formatAsISODate(baseToApply);

  const startNum = parseInt(startNumberStr, 10);
  const validStart = !isNaN(startNum) && startNum >= 1 ? startNum : undefined;
  startPosition.value = validStart;
  setStartPosition(validStart);

  if (viewRange.value.start && viewRange.value.end) {
    generateCalendarEvents(viewRange.value.start, viewRange.value.end);
  }
}

function handlePositionChange(newPosition) {
  const positionValue = parseInt(newPosition, 10);
  startPosition.value = positionValue;
  setStartPosition(positionValue);

  updateCalendarParams(selectedBaseDate.value, positionValue);
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
    updateCalendarParams(selectedBaseDate.value, suggestedStartNumber);
  }

  if (viewRange.value.start && viewRange.value.end) {
    generateCalendarEvents(viewRange.value.start, viewRange.value.end);
  }
}

async function initialize() {
  resetURLIfUnknownParams();
  enforceValidBaseDate();

  try {
    const result = await initializeApp({
      defaultScheduleData,
      nextScheduleData,
      config,
      eventConfig,
    });

    if (!result) {
      alert(ERROR_MESSAGES.INIT_FAILED);
      return;
    }

    const validBaseDates = [defaultBaseDate.value, nextBaseDate.value].filter(
      Boolean,
    );
    const baseDateParam = getDateParam(
      "baseDate", 
      undefined, 
      validBaseDates,
      config,
      result.scheduleData.rotationCycleLength
    );
    const startNumberParam = getNumberParam(
      "startNumber",
      undefined,
      1,
      result.scheduleData.rotationCycleLength,
    );

    let validBaseDate;
    if (baseDateParam) {
      validBaseDate = baseDateParam;
      updateActiveBaseDate(validBaseDate);
    } else if (defaultBaseDate.value) {
      validBaseDate = defaultBaseDate.value;
      updateActiveBaseDate(validBaseDate);
    } else {
      console.error(ERROR_MESSAGES.NO_BASE_DATE);
      return false;
    }

    selectedBaseDate.value = formatAsISODate(validBaseDate);

    if (!baseDateParam || !startNumberParam) {
      setStartPosition(undefined);
      return true;
    }

    setStartPosition(startNumberParam);
    return true;
  } catch (error) {
    console.error(ERROR_MESSAGES.INIT_FAILED, error);
    alert(ERROR_MESSAGES.INIT_FAILED);
    return false;
  }
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
  window.addEventListener("popstate", handlePopstate);
  await initialize();
});

onUnmounted(() => {
  clearSuggestedNumberHandler();
  window.removeEventListener("popstate", handlePopstate);
});
</script>

<style scoped>
.version-link-row {
  flex-basis: 100%;
  margin-top: var(--spacing-xs);
}
.version-btn {
  font-size: 0.78rem;
  padding: 0.1rem 0.45rem;
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
