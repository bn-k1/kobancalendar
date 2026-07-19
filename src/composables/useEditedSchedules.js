// src/composables/useEditedSchedules.js
import { computed } from "vue";
import { useEditedSchedulesStore } from "@/stores/editedSchedules";
import {
  formatAsISODate,
  formatAsDisplayDate,
  getWeekdayName,
} from "@/utils/date";

const STORAGE_KEY = "kobancalendar_edited_schedules";
const HIDDEN_KEY = "kobancalendar_edited_schedules_hidden";

function normalizeSchedule(schedule) {
  return {
    subject: schedule?.subject || "",
    startTime: schedule?.startTime || "",
    endTime: schedule?.endTime || "",
    note: schedule?.note || "",
  };
}

function parseLegacyCsv(stored) {
  const lines = stored.split("\n").filter((line) => line.trim());
  const schedules = {};

  lines.forEach((line) => {
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
 * Edited-schedules management composable.
 *
 * Contains all the business logic for user-edited schedules: localStorage
 * persistence, legacy-format migration, normalization, and CRUD. The store
 * (`stores/editedSchedules.js`) holds only the raw state.
 */
export function useEditedSchedules() {
  const store = useEditedSchedulesStore();

  function toDateStr(date) {
    return typeof date === "string" ? date : formatAsISODate(date);
  }

  /**
   * Load edited schedules from localStorage
   */
  function loadFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        store.setEditedSchedules({});
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
          store.setEditedSchedules(normalized);
          return;
        }
      } catch {
        store.setEditedSchedules(parseLegacyCsv(stored));
        return;
      }

      store.setEditedSchedules({});
    } catch (error) {
      console.error(
        "Failed to load edited schedules from localStorage:",
        error,
      );
      store.setEditedSchedules({});
    }
  }

  /**
   * Load hidden flag from localStorage
   */
  function loadHiddenFromStorage() {
    if (typeof window === "undefined") return;

    try {
      store.setIsEditsHidden(localStorage.getItem(HIDDEN_KEY) === "on");
    } catch (error) {
      console.error("Failed to load edited schedules hidden flag:", error);
      store.setIsEditsHidden(false);
    }
  }

  /**
   * Initialize store state from localStorage
   */
  function initEditedSchedules() {
    if (store.isInitialized) return;
    if (typeof window === "undefined") {
      store.setIsInitialized(true);
      return;
    }

    loadFromStorage();
    loadHiddenFromStorage();
    store.setIsInitialized(true);
  }

  /**
   * Save edited schedules to localStorage
   */
  function saveToStorage(schedules) {
    if (typeof window === "undefined") return;

    try {
      const hasEdits = Object.keys(schedules).length > 0;
      if (hasEdits) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save edited schedules to localStorage:", error);
    }
  }

  /**
   * Save hidden flag to localStorage
   * @param {boolean} hidden
   */
  function setEditsHidden(hidden) {
    store.setIsEditsHidden(!!hidden);
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(HIDDEN_KEY, store.isEditsHidden ? "on" : "off");
    } catch (error) {
      console.error("Failed to save edited schedules hidden flag:", error);
    }
  }

  /**
   * Check if a date has an edited schedule
   * @param {string|dayjs} date - Date to check
   * @returns {boolean}
   */
  function hasEditedSchedule(date) {
    return toDateStr(date) in store.editedSchedules;
  }

  /**
   * Get edited schedule for a date
   * @param {string|dayjs} date - Date to get
   * @returns {Object|undefined}
   */
  function getEditedSchedule(date) {
    return store.editedSchedules[toDateStr(date)];
  }

  /**
   * Save an edited schedule
   * @param {string|dayjs} date - Date to save
   * @param {Object} schedule - Schedule data { subject, startTime, endTime }
   */
  function saveEditedSchedule(date, schedule) {
    const dateStr = toDateStr(date);
    const updated = {
      ...store.editedSchedules,
      [dateStr]: normalizeSchedule(schedule),
    };
    store.setEditedSchedules(updated);
    saveToStorage(updated);
  }

  /**
   * Remove an edited schedule
   * @param {string|dayjs} date - Date to remove
   */
  function removeEditedSchedule(date) {
    const dateStr = toDateStr(date);
    if (!(dateStr in store.editedSchedules)) return;
    const updated = { ...store.editedSchedules };
    delete updated[dateStr];
    store.setEditedSchedules(updated);
    saveToStorage(updated);
  }

  /**
   * Clear all edited schedules
   */
  function clearAllEditedSchedules() {
    store.setEditedSchedules({});
    saveToStorage({});
  }

  /**
   * Get all edited schedules as a sorted array
   * @returns {Array}
   */
  const editedSchedulesList = computed(() => {
    return Object.entries(store.editedSchedules)
      .map(([dateStr, schedule]) => ({
        dateStr,
        displayDate: formatAsDisplayDate(dateStr),
        weekday: getWeekdayName(dateStr),
        ...schedule,
      }))
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  });

  return {
    editedSchedules: computed(() => store.editedSchedules),
    editedSchedulesList,
    hasAnyEdits: computed(() => store.hasAnyEdits),
    isInitialized: computed(() => store.isInitialized),
    isEditsHidden: computed(() => store.isEditsHidden),

    initEditedSchedules,
    hasEditedSchedule,
    getEditedSchedule,
    saveEditedSchedule,
    removeEditedSchedule,
    clearAllEditedSchedules,
    loadFromStorage,
    setEditsHidden,
  };
}
