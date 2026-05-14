import { ref, computed, watch } from "vue";
import { useSchedule } from "@/composables/useSchedule";

/**
 * Search composable for finding schedule subjects.
 * Provides search functionality with autocomplete over the active epoch's
 * shift-table data.
 */
export function useSearch() {
  // Schedule data for the epoch currently being viewed
  const { activeScheduleData } = useSchedule();

  // Local state
  const searchQuery = ref("");
  const searchResults = ref([]);
  const selectedDayType = ref("weekday");
  const hasSearched = ref(false);

  function getNormalizedQuery() {
    return searchQuery.value.trim();
  }

  function hasQuery() {
    return Boolean(getNormalizedQuery());
  }

  function refreshSearchIfNeeded() {
    if (hasQuery()) {
      performSearch();
    }
  }

  // Schedule data for the active epoch
  const currentScheduleData = computed(() => activeScheduleData.value || null);

  // Get current day type data
  const currentDayTypeData = computed(() => {
    if (!currentScheduleData.value) return [];

    switch (selectedDayType.value) {
      case "saturday":
        return currentScheduleData.value.saturday || [];
      case "holiday":
        return currentScheduleData.value.holiday || [];
      default:
        return currentScheduleData.value.weekday || [];
    }
  });

  // Generate all unique subjects for autocomplete suggestions
  const allSuggestions = computed(() => {
    if (!currentDayTypeData.value) return [];

    const subjects = new Set();

    currentDayTypeData.value.forEach((item) => {
      if (item.s && item.s.trim()) {
        subjects.add(item.s.trim());
      }
    });

    return Array.from(subjects).sort();
  });

  // Filter suggestions based on search query
  const filteredSuggestions = computed(() => {
    const query = getNormalizedQuery().toLowerCase();
    if (!query) return [];

    return allSuggestions.value
      .filter((suggestion) => suggestion.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 suggestions
  });

  /**
   * Perform search based on current query and settings
   */
  function performSearch() {
    const query = getNormalizedQuery();
    hasSearched.value = true;

    if (!query || !currentDayTypeData.value) {
      searchResults.value = [];
      return;
    }

    const queryLower = query.toLowerCase();
    const results = [];

    currentDayTypeData.value.forEach((item, index) => {
      if (item.s && item.s.toLowerCase().includes(queryLower)) {
        results.push({
          subject: item.s,
          startTime: item.sT || "",
          endTime: item.eT || "",
          position: index + 1,
          dayType: selectedDayType.value,
        });
      }
    });

    // Sort results by position
    results.sort((a, b) => a.position - b.position);

    searchResults.value = results;
  }

  /**
   * Update day type and refresh search if needed
   */
  function updateDayType(newType) {
    selectedDayType.value = newType;
    refreshSearchIfNeeded();
  }

  /**
   * Clear search results and query
   */
  function clearSearch() {
    searchQuery.value = "";
    searchResults.value = [];
    hasSearched.value = false;
  }

  /**
   * Reset search state
   */
  function resetSearch() {
    clearSearch();
    selectedDayType.value = "weekday";
  }

  // Watch for schedule data changes and reset if needed
  watch(activeScheduleData, () => {
    refreshSearchIfNeeded();
  });

  return {
    // Reactive state
    searchQuery,
    searchResults,
    selectedDayType,
    hasSearched,

    // Computed properties
    filteredSuggestions,
    allSuggestions,
    currentScheduleData,
    currentDayTypeData,

    // Methods
    performSearch,
    updateDayType,
    clearSearch,
    resetSearch,
  };
}
