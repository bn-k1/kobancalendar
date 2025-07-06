// src/composables/useSearch.js
import { ref, computed, watch } from 'vue';
import { useSchedule } from '@/composables/useSchedule';

/**
 * Search composable for finding schedule subjects
 * Provides search functionality with autocomplete for schedule data
 */
export function useSearch() {
  // Get schedule data from store
  const { scheduleDataSets, scheduleUpdateDate } = useSchedule();

  // Local state
  const searchQuery = ref('');
  const searchResults = ref([]);
  const selectedScheduleType = ref('current');
  const selectedDayType = ref('weekday');
  const hasSearched = ref(false);

  // Determine if schedule type selector should be shown
  const showScheduleTypeSelector = computed(() => {
    return scheduleUpdateDate.value !== undefined;
  });

  // Get current schedule data based on selected type
  const currentScheduleData = computed(() => {
    if (!scheduleDataSets.value) return null;
    
    if (showScheduleTypeSelector.value) {
      return selectedScheduleType.value === 'next' 
        ? scheduleDataSets.value.next 
        : scheduleDataSets.value.default;
    }
    
    return scheduleDataSets.value.default;
  });

  // Get current day type data
  const currentDayTypeData = computed(() => {
    if (!currentScheduleData.value) return [];
    
    switch (selectedDayType.value) {
      case 'saturday':
        return currentScheduleData.value.saturday || [];
      case 'holiday':
        return currentScheduleData.value.holiday || [];
      default:
        return currentScheduleData.value.weekday || [];
    }
  });

  // Generate all unique subjects for autocomplete suggestions
  const allSuggestions = computed(() => {
    if (!currentDayTypeData.value) return [];
    
    const subjects = new Set();
    
    currentDayTypeData.value.forEach(item => {
      if (item.s && item.s.trim()) {
        subjects.add(item.s.trim());
      }
    });
    
    return Array.from(subjects).sort();
  });

  // Filter suggestions based on search query
  const filteredSuggestions = computed(() => {
    if (!searchQuery.value.trim()) return [];
    
    const query = searchQuery.value.toLowerCase().trim();
    return allSuggestions.value.filter(suggestion =>
      suggestion.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 suggestions
  });

  /**
   * Perform search based on current query and settings
   */
  function performSearch() {
    const query = searchQuery.value.trim();
    hasSearched.value = true;
    
    if (!query) {
      searchResults.value = [];
      return;
    }
    
    if (!currentDayTypeData.value) {
      searchResults.value = [];
      return;
    }
    
    const queryLower = query.toLowerCase();
    const results = [];
    
    currentDayTypeData.value.forEach((item, index) => {
      if (item.s && item.s.toLowerCase().includes(queryLower)) {
        results.push({
          subject: item.s,
          startTime: item.sT || '',
          endTime: item.eT || '',
          position: index + 1,
          scheduleType: selectedScheduleType.value,
          dayType: selectedDayType.value
        });
      }
    });
    
    // Sort results by position
    results.sort((a, b) => a.position - b.position);
    
    searchResults.value = results;
  }

  /**
   * Update schedule type and refresh search if needed
   */
  function updateScheduleType(newType) {
    selectedScheduleType.value = newType;
    if (searchQuery.value.trim()) {
      performSearch();
    }
  }

  /**
   * Update day type and refresh search if needed
   */
  function updateDayType(newType) {
    selectedDayType.value = newType;
    if (searchQuery.value.trim()) {
      performSearch();
    }
  }

  /**
   * Clear search results and query
   */
  function clearSearch() {
    searchQuery.value = '';
    searchResults.value = [];
    hasSearched.value = false;
  }

  /**
   * Reset search state
   */
  function resetSearch() {
    clearSearch();
    selectedScheduleType.value = 'current';
    selectedDayType.value = 'weekday';
  }

  // Watch for schedule data changes and reset if needed
  watch(scheduleDataSets, () => {
    if (searchQuery.value.trim()) {
      performSearch();
    }
  });

  // Initialize default schedule type based on schedule update date
  watch(showScheduleTypeSelector, (newValue) => {
    if (newValue) {
      // If schedule update is available, default to 'current'
      selectedScheduleType.value = 'current';
    }
  }, { immediate: true });

  return {
    // Reactive state
    searchQuery,
    searchResults,
    selectedScheduleType,
    selectedDayType,
    hasSearched,
    
    // Computed properties
    showScheduleTypeSelector,
    filteredSuggestions,
    allSuggestions,
    currentScheduleData,
    currentDayTypeData,
    
    // Methods
    performSearch,
    updateScheduleType,
    updateDayType,
    clearSearch,
    resetSearch
  };
}