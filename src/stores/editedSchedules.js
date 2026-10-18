// src/stores/editedSchedules.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Edited-schedules store — raw state only.
 * All business logic (localStorage I/O, legacy-format migration,
 * normalization, CRUD, and the derived display list) lives in the
 * useEditedSchedules composable.
 */
export const useEditedSchedulesStore = defineStore("editedSchedules", () => {
  // { [dateStr]: { subject, startTime, endTime, note } }
  const editedSchedules = ref({});
  const isInitialized = ref(false);
  const isEditsHidden = ref(false);

  const hasAnyEdits = computed(
    () => Object.keys(editedSchedules.value).length > 0,
  );

  function setEditedSchedules(schedules) {
    editedSchedules.value =
      schedules && typeof schedules === "object" && !Array.isArray(schedules)
        ? schedules
        : {};
  }

  function setIsInitialized(value) {
    isInitialized.value = !!value;
  }

  function setIsEditsHidden(value) {
    isEditsHidden.value = !!value;
  }

  return {
    editedSchedules: computed(() => editedSchedules.value),
    isInitialized: computed(() => isInitialized.value),
    isEditsHidden: computed(() => isEditsHidden.value),

    hasAnyEdits,

    setEditedSchedules,
    setIsInitialized,
    setIsEditsHidden,
  };
});
