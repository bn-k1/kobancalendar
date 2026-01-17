<!-- src/components/EditedSchedulesList.vue -->
<template>
  <fieldset id="editedSchedulesSection" class="control-group" v-if="hasAnyEdits">
    <legend>編集済み</legend>
    <div class="edited-list">
      <div
        v-for="item in editedSchedulesList"
        :key="item.dateStr"
        class="edited-line"
      >
        <span class="edited-text">{{ item.displayDate }}({{ item.weekday }}) {{ item.subject }}</span>
        <button class="remove-btn" @click="handleRemove(item.dateStr)" aria-label="削除">✕</button>
      </div>
    </div>
  </fieldset>
</template>

<script setup>
import { useEditedSchedules } from "@/composables/useEditedSchedules";

const { editedSchedulesList, hasAnyEdits, removeEditedSchedule } = useEditedSchedules();

function handleRemove(dateStr) {
  removeEditedSchedule(dateStr);
  window.location.reload();
}
</script>

<style scoped>
.edited-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edited-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  font-size: 0.9rem;
}

.edited-text {
  color: #e91e63;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  background-color: var(--error-color);
  color: white;
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.remove-btn:hover {
  background-color: #d91a6a;
}
</style>