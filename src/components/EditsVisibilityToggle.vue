<!-- src/components/EditsVisibilityToggle.vue -->
<template>
  <div v-if="isVisible" class="edits-visibility-row">
    <button
      type="button"
      class="edits-visibility-btn"
      :class="{ 'is-hidden': isEditsHidden }"
      :aria-pressed="!isEditsHidden"
      @click="toggleHidden"
    >
      <EyeToggleIcon :hidden="isEditsHidden" />
      <span>{{
        isEditsHidden ? "入力した予定を表示する" : "入力した予定を隠す"
      }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useEditedSchedules } from "@/composables/useEditedSchedules";
import EyeToggleIcon from "@/components/Icons/EyeToggleIcon.vue";

const { editedSchedulesList, isEditsHidden, setEditsHidden } =
  useEditedSchedules();
const emit = defineEmits(["editedChanged"]);

// Only meaningful when there is something to show/hide; stay visible while
// hidden so the user can always switch back.
const isVisible = computed(
  () => editedSchedulesList.value.length > 0 || isEditsHidden.value,
);

function toggleHidden() {
  setEditsHidden(!isEditsHidden.value);
  emit("editedChanged");
}
</script>

<style scoped>
.edits-visibility-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-sm);
}

.edits-visibility-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  padding: 0.25rem 0.8rem;
  min-height: 34px;
  border-radius: var(--border-radius-pill);
  border: 1.5px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  box-shadow: none;
}

.edits-visibility-btn:hover {
  background: var(--primary-color);
  color: var(--text-light);
  transform: none;
  box-shadow: none;
}

.edits-visibility-btn.is-hidden {
  border-color: var(--error-color);
  color: var(--error-color);
}

.edits-visibility-btn.is-hidden:hover {
  background: var(--error-color);
  color: var(--text-light);
}
</style>
