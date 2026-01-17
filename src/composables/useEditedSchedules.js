// src/composables/useEditedSchedules.js
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { formatAsISODate, formatAsDisplayDate, getWeekdayName } from "@/utils/date";

const STORAGE_KEY = "kobancalendar_edited_schedules";
const HIDDEN_KEY = "kobancalendar_edited_schedules_hidden";

function normalizeSchedule(schedule) {
  return {
    subject: schedule?.subject || "",
    startTime: schedule?.startTime || "",
    endTime: schedule?.endTime || "",
  };
}

function parseLegacyCsv(stored) {
  const lines = stored.split("\n").filter(line => line.trim());
  const schedules = {};

  lines.forEach(line => {
    const [dateStr, subject, startTime, endTime] = line.split(",");
    if (dateStr) {
      schedules[dateStr] = normalizeSchedule({
        subject,
        startTime,
        endTime,
      });
    }
  });

  return schedules;
}

/**
 * Store for managing user-edited schedules
 * Stores edits in localStorage and provides methods to manage them
 */
export const useEditedSchedules = defineStore("editedSchedules", () => {
  // Reactive state
  const editedSchedules = ref({});
  const isInitialized = ref(false);
  const isEditsHidden = ref(false);

  /**
   * Load edited schedules from localStorage
   */
  function loadFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        editedSchedules.value = {};
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const normalized = {};
          Object.entries(parsed).forEach(([dateStr, schedule]) => {
            if (dateStr) {
              normalized[dateStr] = normalizeSchedule(schedule);
            }
          });
          editedSchedules.value = normalized;
          return;
        }
      } catch (parseError) {
        editedSchedules.value = parseLegacyCsv(stored);
        return;
      }

      editedSchedules.value = {};
    } catch (error) {
      console.error("Failed to load edited schedules from localStorage:", error);
      editedSchedules.value = {};
    }
  }

  /**
   * Load hidden flag from localStorage
   */
  function loadHiddenFromStorage() {
    if (typeof window === "undefined") return;

    try {
      isEditsHidden.value = localStorage.getItem(HIDDEN_KEY) === "on";
    } catch (error) {
      console.error("Failed to load edited schedules hidden flag:", error);
      isEditsHidden.value = false;
    }
  }

  /**
   * Initialize store state from localStorage
   */
  function initEditedSchedules() {
    if (isInitialized.value) return;
    if (typeof window === "undefined") {
      isInitialized.value = true;
      return;
    }

    loadFromStorage();
    loadHiddenFromStorage();
    isInitialized.value = true;
  }

  /**
   * Save hidden flag to localStorage
   * @param {boolean} hidden
   */
  function setEditsHidden(hidden) {
    isEditsHidden.value = !!hidden;
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(HIDDEN_KEY, isEditsHidden.value ? "on" : "off");
    } catch (error) {
      console.error("Failed to save edited schedules hidden flag:", error);
    }
  }

  /**
   * Save edited schedules to localStorage
   */
  function saveToStorage() {
    if (typeof window === "undefined") return;

    try {
      const hasEdits = Object.keys(editedSchedules.value).length > 0;
      if (hasEdits) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(editedSchedules.value),
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save edited schedules to localStorage:", error);
    }
  }

  /**
   * Check if a date has an edited schedule
   * @param {string|dayjs} date - Date to check
   * @returns {boolean}
   */
  function hasEditedSchedule(date) {
    const dateStr = typeof date === "string" ? date : formatAsISODate(date);
    return dateStr in editedSchedules.value;
  }

  /**
   * Get edited schedule for a date
   * @param {string|dayjs} date - Date to get
   * @returns {Object|undefined}
   */
  function getEditedSchedule(date) {
    const dateStr = typeof date === "string" ? date : formatAsISODate(date);
    return editedSchedules.value[dateStr];
  }

  /**
   * Save an edited schedule
   * @param {string|dayjs} date - Date to save
   * @param {Object} schedule - Schedule data { subject, startTime, endTime }
   */
  function saveEditedSchedule(date, schedule) {
    const dateStr = typeof date === "string" ? date : formatAsISODate(date);
    editedSchedules.value[dateStr] = normalizeSchedule(schedule);
    saveToStorage();
  }

  /**
   * Remove an edited schedule
   * @param {string|dayjs} date - Date to remove
   */
  function removeEditedSchedule(date) {
    const dateStr = typeof date === "string" ? date : formatAsISODate(date);
    if (dateStr in editedSchedules.value) {
      delete editedSchedules.value[dateStr];
      saveToStorage();
    }
  }

  /**
   * Clear all edited schedules
   */
  function clearAllEditedSchedules() {
    editedSchedules.value = {};
    saveToStorage();
  }

  /**
   * Get all edited schedules as a sorted array
   * @returns {Array}
   */
  const editedSchedulesList = computed(() => {
    return Object.entries(editedSchedules.value)
      .map(([dateStr, schedule]) => ({
        dateStr,
        displayDate: formatAsDisplayDate(dateStr),
        weekday: getWeekdayName(dateStr),
        ...schedule,
      }))
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  });

  /**
   * Check if there are any edited schedules
   */
  const hasAnyEdits = computed(() => {
    return Object.keys(editedSchedules.value).length > 0;
  });

  return {
    editedSchedules,
    editedSchedulesList,
    hasAnyEdits,
    isInitialized,
    isEditsHidden,

    initEditedSchedules,
    hasEditedSchedule,
    getEditedSchedule,
    saveEditedSchedule,
    removeEditedSchedule,
    clearAllEditedSchedules,
    loadFromStorage,
    setEditsHidden,
  };
});
