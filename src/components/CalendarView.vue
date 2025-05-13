<!-- src/components/CalendarView.vue -->
<template>
  <div class="calendar-container">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useHolidays } from "@/composables/useHolidays";
import { CALENDAR_CONFIG } from "@/utils/constants";
import { createDate, isSameDay, today } from "@/utils/date";

// Props
const props = defineProps({
  initialDate: {
    type: [Date, Object],
  },
  startPosition: {
    type: Number,
    required: false,
  },
  events: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["datesSet"]);

// Composables
const { isHoliday, getHolidayName } = useHolidays();

// Local state
const calendarRef = ref(undefined);
const viewStart = ref(undefined);
const viewEnd = ref(undefined);

// Calendar options
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: CALENDAR_CONFIG.INITIAL_VIEW,
  initialDate: props.initialDate ? props.initialDate : undefined,
  locale: CALENDAR_CONFIG.LOCALE,
  events: props.events,
  aspectRatio: CALENDAR_CONFIG.DEFAULT_ASPECT_RATIO,
  height: CALENDAR_CONFIG.HEIGHT,

  // Custom day cell class names
  dayCellClassNames: (arg) => {
    const date = createDate(arg.date);
    const classNames = [];

    if (isHoliday(date)) {
      classNames.push("holiday");
    }
    if (date.day() === 6) {
      classNames.push("fc-day-sat");
    }
    if (date.day() === 0) {
      classNames.push("fc-day-sun");
    }
    if (isSameDay(date, today())) {
      classNames.push("today-highlight");
    }

    return classNames;
  },

  // Custom event content rendering
  eventContent: (arg) => {
    const { event } = arg;
    let [title, startTime = "", endTime = ""] = event.title.split("\n");
    const { shiftIndex } = event.extendedProps;
    const date = createDate(event.start);

    const holidayName = getHolidayName(date);
    const metaInfo = holidayName
      ? `${shiftIndex + 1} ${holidayName}`
      : `${shiftIndex + 1}`;

    return {
      html: `
        <div class="event-title">${title}</div>
        ${startTime ? `<div class="event-time">${startTime}</div>` : ""}
        ${endTime ? `<div class="event-time">${endTime}</div>` : ""}
        <div class="event-meta">${metaInfo}</div>
      `,
    };
  },

  // Handler for date range changes
  datesSet: (info) => {
    const newStart = createDate(info.start);
    const newEnd = createDate(info.end);

    // Only update if view range has changed
    if (
      !viewStart.value ||
      !viewEnd.value ||
      !newStart.isSame(viewStart.value) ||
      !newEnd.isSame(viewEnd.value)
    ) {
      viewStart.value = newStart;
      viewEnd.value = newEnd;
      emit("datesSet", { start: newStart, end: newEnd });
    }
  },
}));

// Watch for changes to start position or initialDate
watch([() => props.startPosition, () => props.initialDate], () => {
  if (viewStart.value && viewEnd.value) {
    emit("datesSet", { start: viewStart.value, end: viewEnd.value });
  }
});

// Initialize
onMounted(() => {
  // Use setTimeout to ensure calendar is fully rendered
  setTimeout(() => {
    if (calendarRef.value) {
      const api = calendarRef.value.getApi();
      viewStart.value = createDate(api.view.activeStart);
      viewEnd.value = createDate(api.view.activeEnd);
      emit("datesSet", { start: viewStart.value, end: viewEnd.value });
    }
  }, 0);
});
</script>

<style scoped>
/* Calendar-specific styles with :deep() selector */
.calendar-container {
  width: 100%;
  margin: var(--spacing-lg) auto;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  background-color: var(--background-light);
  box-shadow: var(--shadow-lg);
}

:deep(.fc .fc-toolbar) {
  padding: var(--spacing-md);
  background-color: var(--primary-color);
  color: var(--text-light);
  flex-wrap: wrap;
}

:deep(.fc .fc-toolbar-title) {
  font-weight: var(--font-weight-bold);
  font-size: 1.3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.fc .fc-button) {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  font-size: 0.95rem;
}

:deep(.fc .fc-button:hover) {
  background-color: var(--primary-light);
  border-color: var(--primary-light);
}

:deep(.fc .fc-col-header-cell) {
  background-color: var(--primary-light);
  color: var(--text-light);
  font-size: 1rem;
}

:deep(.fc-daygrid-event .fc-event-title) {
  font-weight: var(--font-weight-medium);
  color: white;
  white-space: pre-line;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.event-title) {
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.event-time) {
  color: var(--text-color);
  font-size: 0.95rem;
  opacity: 0.9;
}

:deep(.event-meta) {
  font-size: 0.75rem;
  color: var(--gray-700);
  margin-top: 2px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

:deep(.fc-day-sat) {
  background-color: var(--saturday-color) !important;
}

:deep(.fc-day-sun),
:deep(.holiday) {
  background-color: var(--holiday-color) !important;
}

:deep(.today-highlight) {
  position: relative;
  z-index: 1;
}

:deep(.today-highlight::after) {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid var(--accent-color);
  pointer-events: none;
  z-index: 2;
  border-radius: 2px;
}
</style>
