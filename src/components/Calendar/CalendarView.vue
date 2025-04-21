<!-- src/components/Calendar/CalendarView.vue -->
<template>
  <div class="calendar-container">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendar } from '@/composables/useCalendar';
import { useHolidays } from '@/composables/useHolidays';
import { CALENDAR_CONFIG } from '@/config/constants';

// Props
const props = defineProps({
  initialDate: {
    type: [Date, Object],
    default: null,
  },
  startPosition: {
    type: Number,
    required: true,
  },
  events: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(['datesSet']);

// Composables
const { isHoliday, getHolidayName } = useHolidays();
const { generateCalendarEvents } = useCalendar();

// Local state
const calendarRef = ref(null);
const viewStart = ref(null);
const viewEnd = ref(null);

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
    const date = dayjs(arg.date);
    const classNames = [];

    if (isHoliday(date)) {
      classNames.push('holiday');
    }
    if (date.day() === 6) {
      classNames.push('fc-day-sat');
    }
    if (date.day() === 0) {
      classNames.push('fc-day-sun');
    }
    if (date.isSame(dayjs().startOf('day'), 'day')) {
      classNames.push('today-highlight');
    }

    return classNames;
  },

  // Custom event content rendering
  eventContent: (arg) => {
    const { event } = arg;
    let [title, startTime = '', endTime = ''] = event.title.split('\n');
    const { shiftIndex } = event.extendedProps;
    const date = dayjs(event.start);

    const holidayName = getHolidayName(date);
    const metaInfo = holidayName
      ? `${shiftIndex + 1} ${holidayName}`
      : `${shiftIndex + 1}`;

    return {
      html: `
        <div class="event-title">${title}</div>
        ${startTime ? `<div class="event-time">${startTime}</div>` : ''}
        ${endTime ? `<div class="event-time">${endTime}</div>` : ''}
        <div class="event-meta">${metaInfo}</div>
      `,
    };
  },

  // Handler for date range changes
  datesSet: (info) => {
    const newStart = dayjs(info.start);
    const newEnd = dayjs(info.end);

    // Only update if view range has changed
    if (
      !viewStart.value ||
      !viewEnd.value ||
      !newStart.isSame(viewStart.value) ||
      !newEnd.isSame(viewEnd.value)
    ) {
      viewStart.value = newStart;
      viewEnd.value = newEnd;
      emit('datesSet', { start: newStart, end: newEnd });
    }
  },
}));

// Navigate to a specific date
function gotoDate(date) {
  if (calendarRef.value) {
    calendarRef.value.getApi().gotoDate(date.toDate());
  }
}

// Expose methods to parent component
defineExpose({
  gotoDate,
});

// Watch for changes to start position
watch(() => props.startPosition, () => {
  if (viewStart.value && viewEnd.value) {
    emit('datesSet', { start: viewStart.value, end: viewEnd.value });
  }
});

// Initialize
onMounted(() => {
  // Use setTimeout to ensure calendar is fully rendered
  setTimeout(() => {
    if (calendarRef.value) {
      const api = calendarRef.value.getApi();
      viewStart.value = dayjs(api.view.activeStart);
      viewEnd.value = dayjs(api.view.activeEnd);
      emit('datesSet', { start: viewStart.value, end: viewEnd.value });
    }
  }, 0);
});
</script>

<style scoped>
/* Calendar-specific styles could go here,
   but most styles are in global CSS */
</style>