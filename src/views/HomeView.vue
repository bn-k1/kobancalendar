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
          :display-as-text="formattedBaseDates.length === 1"
          :options="formattedBaseDates"
          :formatter="formatAsDisplayDate"
          :schedule-update-notice="scheduleUpdateNotice"
          @change="handleBaseDateChange"
        />

        <PositionSelector
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
import { ref, computed, onMounted, watch, defineAsyncComponent } from "vue";

import UnifiedPageLayout from "@/layouts/UnifiedPageLayout.vue";
import BaseSelector from "@/components/Controls/BaseSelector.vue";
import PositionSelector from "@/components/Controls/PositionSelector.vue";

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
import { useEditedSchedules } from "@/composables/useEditedSchedules";
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

import defaultScheduleData from "@data/default/default.json";
import nextScheduleData from "@data/next/next.json";
import eventConfig from "@config/event.json";
import config from "@config/config.json";

const { getDateParam, getNumberParam, updateCalendarParams } = useUrlParams();
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
  scheduleUpdateDate,
  updateActiveBaseDate,
} = useSchedule();

const formattedBaseDates = computed(() => {
  const dates = [];

  if (defaultBaseDate.value) {
    dates.push({
      value: formatAsISODate(defaultBaseDate.value),
      text: formatAsDisplayDate(defaultBaseDate.value),
    });
  }

  if (
    nextBaseDate.value &&
    nextBaseDate.value.isValid &&
    nextBaseDate.value.isValid() &&
    !(
      defaultBaseDate.value &&
      formatAsISODate(defaultBaseDate.value) ===
        formatAsISODate(nextBaseDate.value)
    )
  ) {
    dates.push({
      value: formatAsISODate(nextBaseDate.value),
      text: formatAsDisplayDate(nextBaseDate.value),
    });
  }

  return dates;
});

const positionOptions = computed(() => {
  return Array.from({ length: rotationCycleLength.value }, (_, i) => ({
    value: i + 1,
    text: String(i + 1),
  }));
});

const scheduleUpdateNotice = computed(() => {
  if (scheduleUpdateDate.value) {
    return formatAsDisplayDate(scheduleUpdateDate.value);
  }
  return "";
});

const initialDate = computed(() => {
  if (!activeBaseDate.value) return undefined;

  const currentDay = today();
  return isSameOrAfter(activeBaseDate.value, currentDay)
    ? toDate(activeBaseDate.value)
    : toDate(currentDay);
});

const startPosition = ref(undefined);

function handleBaseDateChange(newDateStr) {
  const newDate = createDate(newDateStr);
  updateActiveBaseDate(newDate);
  startPosition.value = undefined;
  setStartPosition(undefined);

  updateCalendarParams(newDate, startPosition.value);
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

async function initialize() {
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
  await initialize();
});
</script>

<style scoped>
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
