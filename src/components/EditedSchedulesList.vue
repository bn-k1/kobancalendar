<!-- src/components/EditedSchedulesList.vue -->
<template>
  <fieldset id="editedSchedulesSection" class="control-group" v-if="hasAnyEdits">
    <legend @click="toggleExpanded" class="clickable-legend">
      編集済み ({{ editedSchedulesList.length }})
      <span class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</span>
      <button
        type="button"
        class="visibility-icon"
        :class="{ 'is-hidden': isEditsHidden }"
        @click.stop="toggleHidden"
        :aria-label="isEditsHidden ? '編集済み予定を表示する' : '編集済み予定を非表示にする'"
        :title="isEditsHidden ? '編集済み予定を表示する' : '編集済み予定を非表示にする'"
      >
        <EyeToggleIcon :hidden="isEditsHidden" />
      </button>
    </legend>
    <div v-show="showList" class="edited-list">
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
import { computed, ref } from 'vue';
import { useEditedSchedules } from "@/composables/useEditedSchedules";
import EyeToggleIcon from "@/components/Icons/EyeToggleIcon.vue";

const {
  editedSchedulesList,
  hasAnyEdits,
  removeEditedSchedule,
  isEditsHidden,
  setEditsHidden,
} = useEditedSchedules();
const isExpanded = ref(false);
const showList = computed(() => isExpanded.value && !isEditsHidden.value);

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function toggleHidden() {
  setEditsHidden(!isEditsHidden.value);
  window.location.reload();
}

function handleRemove(dateStr) {
  removeEditedSchedule(dateStr);
  window.location.reload();
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

.visibility-icon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}

.visibility-icon:hover {
  border-color: var(--primary-color);
  background: var(--gray-100);
}

.visibility-icon.is-hidden {
  color: var(--error-color);
}

.edited-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
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
