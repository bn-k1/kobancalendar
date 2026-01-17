<!-- src/components/CalendarView.vue -->
<template>
  <div class="calendar-container">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
    
    <EditScheduleModal
      :show="showEditModal"
      :date="editingDate"
      :day-type="editingDayType"
      :current-schedule="editingCurrentSchedule"
      @close="closeEditModal"
      @save="handleSaveEdit"
      @remove="handleRemoveEdit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useHolidays } from "@/composables/useHolidays";
import { useEditedSchedules } from "@/composables/useEditedSchedules";
import { CALENDAR_CONFIG } from "@/utils/constants";
import { createDate, isSameDay, today, formatAsISODate } from "@/utils/date";
import EditScheduleModal from "@/components/EditScheduleModal.vue";

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

const emit = defineEmits(["datesSet", "scheduleEdited"]);

const { isHoliday, getHolidayName } = useHolidays();
const {
  hasEditedSchedule,
  getEditedSchedule,
  saveEditedSchedule,
  removeEditedSchedule,
  isEditsHidden,
} = useEditedSchedules();

const calendarRef = ref(undefined);
const viewStart = ref(undefined);
const viewEnd = ref(undefined);

const showEditModal = ref(false);
const editingDate = ref(null);
const editingDayType = ref("weekday");
const editingCurrentSchedule = ref({});

let longPressTimer = null;
let pressedEventInfo = null;
const LONG_PRESS_DURATION = 500;

// Edited schedule color - pink/magenta that doesn't conflict with existing colors
const EDITED_COLOR = "#e91e63";

const mergedEvents = computed(() => {
  return props.events.map(event => {
    if (isEditsHidden.value) {
      return {
        ...event,
        extendedProps: {
          ...event.extendedProps,
          isEdited: false,
        },
      };
    }

    const dateStr = formatAsISODate(event.start);
    const editedSchedule = getEditedSchedule(dateStr);
    
    if (editedSchedule) {
      const title = editedSchedule.startTime || editedSchedule.endTime
        ? `${editedSchedule.subject}\n${editedSchedule.startTime} - \n${editedSchedule.endTime}`
        : editedSchedule.subject;
      
      return {
        ...event,
        title,
        color: EDITED_COLOR,
        extendedProps: {
          ...event.extendedProps,
          isEdited: true,
          editedSubject: editedSchedule.subject,
          startTime: editedSchedule.startTime,
          endTime: editedSchedule.endTime,
        },
      };
    }
    
    return {
      ...event,
      extendedProps: {
        ...event.extendedProps,
        isEdited: false,
      },
    };
  });
});

function handlePressStart(info, event) {
  pressedEventInfo = { event: info.event, jsEvent: event };
  
  longPressTimer = setTimeout(() => {
    if (pressedEventInfo) {
      openEditModal(pressedEventInfo.event);
    }
  }, LONG_PRESS_DURATION);
}

function handlePressEnd() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  pressedEventInfo = null;
}

function openEditModal(event) {
  const dateObj = createDate(event.start);
  const dateStr = formatAsISODate(dateObj);
  
  let dayType = "weekday";
  if (isHoliday(dateObj) || dateObj.day() === 0) {
    dayType = "holiday";
  } else if (dateObj.day() === 6) {
    dayType = "saturday";
  }
  
  const extendedProps = event.extendedProps || {};
  let currentSchedule = {};
  
  if (extendedProps.isEdited) {
    currentSchedule = {
      subject: extendedProps.editedSubject,
      startTime: extendedProps.startTime,
      endTime: extendedProps.endTime,
    };
  } else {
    const titleParts = event.title.split("\n");
    currentSchedule = {
      subject: titleParts[0] || "",
      startTime: extendedProps.startTime || "",
      endTime: extendedProps.endTime || "",
    };
  }
  
  editingDate.value = dateStr;
  editingDayType.value = dayType;
  editingCurrentSchedule.value = currentSchedule;
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  editingDate.value = null;
  editingCurrentSchedule.value = {};
}

function handleSaveEdit(editData) {
  saveEditedSchedule(editData.date, {
    subject: editData.subject,
    startTime: editData.startTime,
    endTime: editData.endTime,
  });
  
  closeEditModal();
  emit("scheduleEdited", editData);
}

function handleRemoveEdit(dateStr) {
  removeEditedSchedule(dateStr);
  closeEditModal();
  emit("scheduleEdited", { date: dateStr, removed: true });
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: CALENDAR_CONFIG.INITIAL_VIEW,
  initialDate: props.initialDate ? props.initialDate : undefined,
  locale: CALENDAR_CONFIG.LOCALE,
  events: mergedEvents.value,
  aspectRatio: CALENDAR_CONFIG.DEFAULT_ASPECT_RATIO,
  height: CALENDAR_CONFIG.HEIGHT,
  selectable: false,
  editable: false,

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

  eventContent: (arg) => {
    const { event } = arg;
    let [title, startTime = "", endTime = ""] = event.title.split("\n");
    const { shiftIndex, isEdited } = event.extendedProps;
    const date = createDate(event.start);

    const holidayName = getHolidayName(date);
    const komaichi = holidayName
      ? `${shiftIndex + 1} ${holidayName}`
      : `${shiftIndex + 1}`;

    const editedIndicator = isEdited ? '✎ ' : '';

    return {
      html: `
        <div class="event-title">${editedIndicator}${title}</div>
        ${startTime ? `<div class="event-time">${startTime}</div>` : ""}
        ${endTime ? `<div class="event-time">${endTime}</div>` : ""}
        <div class="event-meta">${komaichi}</div>
      `,
    };
  },

  eventDidMount: (info) => {
    const el = info.el;
    
    el.addEventListener("mousedown", (e) => handlePressStart(info, e));
    el.addEventListener("mouseup", handlePressEnd);
    el.addEventListener("mouseleave", handlePressEnd);
    
    el.addEventListener("touchstart", (e) => handlePressStart(info, e), { passive: true });
    el.addEventListener("touchend", handlePressEnd);
    el.addEventListener("touchcancel", handlePressEnd);
    
    el.classList.add("long-press-enabled");
  },

  datesSet: (info) => {
    const newStart = createDate(info.start);
    const newEnd = createDate(info.end);

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

watch([() => props.startPosition, () => props.initialDate], () => {
  if (viewStart.value && viewEnd.value) {
    emit("datesSet", { start: viewStart.value, end: viewEnd.value });
  }
});

onUnmounted(() => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
  }
});

onMounted(() => {
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

:deep(.long-press-enabled) {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

:deep(.long-press-enabled:active) {
  opacity: 0.8;
}
</style>
