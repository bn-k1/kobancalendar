<!-- src/components/DetailsModal.vue -->
<template>
  <div
    id="detailsModal"
    class="modal"
    :class="{ hidden: !show }"
    @click="closeModalOnOutsideClick"
  >
    <div class="modal-content">
      <span class="close-modal" @click="$emit('close')">&times;</span>
      <h3 id="modalDate">{{ title }}</h3>
      <table id="detailsTable" class="details-table">
        <thead>
          <tr>
            <th>コマ位置</th>
            <th>当日</th>
            <th>翌日</th>
            <th>参加可否</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="detail in details.details" :key="detail.position">
            <td>{{ detail.position }}</td>
            <td>{{ getCurrentDayShift(detail) }}</td>
            <td>{{ getNextDayShift(detail) }}</td>
            <td
              :class="
                detail.isAvailable ? 'availability-yes' : 'availability-no'
              "
            ></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useSchedule } from "@/composables/useSchedule";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  details: {
    type: Object,
    default: () => ({ details: [] }),
  },
});

const emit = defineEmits(["close"]);

// Dependencies
const { getScheduleForDate } = useSchedule();

// Close modal when clicking outside
function closeModalOnOutsideClick(event) {
  if (event.target.id === "detailsModal") {
    emit("close");
  }
}

// Get current day shift description
function getCurrentDayShift(detail) {
  if (!detail || !detail.position || !props.details || !props.details.date) {
    return "-";
  }

  // Current day schedule
  const currentDaySchedule = detail.schedule;

  // Format and return shift description
  if (currentDaySchedule && currentDaySchedule.subject) {
    if (currentDaySchedule.endTime) {
      return `~${currentDaySchedule.endTime}(${currentDaySchedule.subject})`;
    }
    return currentDaySchedule.subject;
  }

  return "-";
}

// Get next day shift description
function getNextDayShift(detail) {
  if (!detail || !detail.position || !props.details || !props.details.date) {
    return "-";
  }

  // Next day schedule
  const nextDay = props.details.date.add(1, "day");
  const nextDaySchedule = getScheduleForDate(nextDay, detail.position);

  // Format and return shift description
  if (nextDaySchedule && nextDaySchedule.subject) {
    if (nextDaySchedule.startTime) {
      return `${nextDaySchedule.startTime}~(${nextDaySchedule.subject})`;
    }
    return nextDaySchedule.subject;
  }

  return "-";
}
</script>

<style scoped>
.details-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.details-table th,
.details-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
  font-size: 1.02rem;
}

.details-table th {
  background-color: var(--primary-light);
  color: var(--text-light);
  font-weight: var(--font-weight-medium);
  text-align: left;
  white-space: nowrap;
}

.details-table tr:last-child td {
  border-bottom: none;
}

.availability-yes {
  color: var(--success-color);
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
}

.availability-yes::before {
  content: "✓";
  display: inline-block;
  font-size: 1.4em;
}

.availability-no {
  color: var(--error-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.availability-no::before {
  content: "✗";
  display: inline-block;
  font-size: 1.4em;
}
</style>
