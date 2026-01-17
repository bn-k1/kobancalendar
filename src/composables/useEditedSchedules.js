// src/composables/useEditedSchedules.js
import { ref, computed, onMounted } from "vue";
import { formatAsISODate, formatAsDisplayDate, getWeekdayName } from "@/utils/date";

const STORAGE_KEY = "kobancalendar_edited_schedules";
const HIDDEN_KEY = "kobancalendar_edited_schedules_hidden";

/**
 * Composable for managing user-edited schedules
 * Stores edits in localStorage and provides methods to manage them
 */
export function useEditedSchedules() {
  // Reactive state
  const editedSchedules = ref({});
  const isInitialized = ref(false);
  const isEditsHidden = ref(false);

  /**
   * Load edited schedules from localStorage
   */
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lines = stored.split("\n").filter(line => line.trim());
        const schedules = {};
        
        lines.forEach(line => {
          const [dateStr, subject, startTime, endTime] = line.split(",");
          if (dateStr) {
            schedules[dateStr] = {
              subject: subject || "",
              startTime: startTime || "",
              endTime: endTime || "",
            };
          }
        });
        
        editedSchedules.value = schedules;
      }
      isInitialized.value = true;
    } catch (error) {
      console.error("Failed to load edited schedules from localStorage:", error);
      editedSchedules.value = {};
      isInitialized.value = true;
    }
  }

  /**
   * Load hidden flag from localStorage
   */
  function loadHiddenFromStorage() {
    try {
      isEditsHidden.value = localStorage.getItem(HIDDEN_KEY) === "on";
    } catch (error) {
      console.error("Failed to load edited schedules hidden flag:", error);
      isEditsHidden.value = false;
    }
  }

  /**
   * Save hidden flag to localStorage
   * @param {boolean} hidden
   */
  function setEditsHidden(hidden) {
    isEditsHidden.value = !!hidden;
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
    try {
      const lines = Object.entries(editedSchedules.value)
        .map(([dateStr, schedule]) => {
          return `${dateStr},${schedule.subject},${schedule.startTime},${schedule.endTime}`;
        })
        .join("\n");
      
      if (lines) {
        localStorage.setItem(STORAGE_KEY, lines);
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
    editedSchedules.value[dateStr] = {
      subject: schedule.subject || "",
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
    };
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

  // Initialize on first use
  if (!isInitialized.value) {
    loadFromStorage();
    loadHiddenFromStorage();
  }

  return {
    editedSchedules,
    editedSchedulesList,
    hasAnyEdits,
    isInitialized,
    isEditsHidden,
    
    hasEditedSchedule,
    getEditedSchedule,
    saveEditedSchedule,
    removeEditedSchedule,
    clearAllEditedSchedules,
    loadFromStorage,
    setEditsHidden,
  };
}
