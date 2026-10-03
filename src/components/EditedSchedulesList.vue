<!-- src/components/EditedSchedulesList.vue -->
<template>
  <fieldset
    id="editedSchedulesSection"
    class="control-group"
    :style="editedColorStyle"
  >
    <legend class="clickable-legend" @click="toggleExpanded">
      入力した予定の管理 ({{ editedSchedulesList.length }})
      <span class="toggle-icon">{{ isExpanded ? "▼" : "▶" }}</span>
    </legend>
    <div v-if="showEmptyNotice" class="edited-empty-notice">
      {{ EDITED_SCHEDULE_EMPTY_NOTICE }}
    </div>
    <div v-show="showList" class="edited-list">
      <div
        v-for="item in editedSchedulesList"
        :key="item.dateStr"
        class="edited-line"
      >
        <span class="edited-text"
          >{{ item.displayDate }}({{ item.weekday }}) {{ item.subject }}</span
        >
        <button
          class="remove-btn"
          aria-label="削除"
          @click="handleRemove(item.dateStr)"
        >
          ✕
        </button>
      </div>
    </div>
  </fieldset>
</template>

<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useEditedSchedules } from "@/composables/useEditedSchedules";
import { useCalendarStore } from "@/stores/calendar";
import { EDITED_SCHEDULE_EMPTY_NOTICE } from "@/utils/constants";

const { editedSchedulesList, removeEditedSchedule } = useEditedSchedules();
const emit = defineEmits(["editedChanged"]);
const isExpanded = ref(false);
const showList = computed(() => isExpanded.value);
const showEmptyNotice = computed(() => {
  return isExpanded.value && editedSchedulesList.value.length === 0;
});

const calendarStore = useCalendarStore();
const { eventConfig } = storeToRefs(calendarStore);

const editedColorStyle = computed(() => {
  const color = eventConfig.value?.edited?.color;
  return color ? { "--edited-color": color } : undefined;
});

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function handleRemove(dateStr) {
  removeEditedSchedule(dateStr);
  emit("editedChanged");
}
</script>

<style scoped>
.clickable-legend {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.clickable-legend:hover {
  opacity: 0.8;
}

.toggle-icon {
  font-size: 0.8em;
  transition: transform 0.2s ease;
}

.edited-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.edited-empty-notice {
  color: var(--error-color);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: var(--font-weight-medium);
}

.edited-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  font-size: 0.9rem;
}

.edited-text {
  color: var(--edited-color, #e91e63);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  background-color: var(--error-color);
  color: white;
  width: 28px;
  height: 28px;
  min-height: unset;
  min-width: 28px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: none;
}

.remove-btn:hover {
  background-color: #dc2626;
  transform: none;
  box-shadow: none;
}
</style>
