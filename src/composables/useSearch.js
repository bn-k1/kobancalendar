import { ref, computed, watch } from "vue";
import { useSchedule } from "@/composables/useSchedule";

/**
 * Subject search with autocomplete over the active epoch's table in effect
 * today (an in-epoch table swap may have replaced the first segment).
 */
export function useSearch() {
  const { activeScheduleDataForToday } = useSchedule();

  const searchQuery = ref("");
  const searchResults = ref([]);
  const selectedDayType = ref("weekday");
  const hasSearched = ref(false);

  const query = () => searchQuery.value.trim().toLowerCase();

  const dayTypeRows = computed(
    () => activeScheduleDataForToday.value?.[selectedDayType.value] || [],
  );

  const filteredSuggestions = computed(() => {
    const q = query();
    if (!q) return [];
    const subjects = new Set(
      dayTypeRows.value.map((row) => row.s?.trim()).filter(Boolean),
    );
    return [...subjects]
      .sort()
      .filter((subject) => subject.toLowerCase().includes(q))
      .slice(0, 10);
  });

  function performSearch() {
    const q = query();
    hasSearched.value = true;
    searchResults.value = !q
      ? []
      : dayTypeRows.value.flatMap((row, index) =>
          row.s?.toLowerCase().includes(q)
            ? [
                {
                  subject: row.s,
                  startTime: row.sT || "",
                  endTime: row.eT || "",
                  overtime: row.c,
                  midBreak: row.k,
                  position: index + 1,
                  dayType: selectedDayType.value,
                },
              ]
            : [],
        );
  }

  function refreshSearchIfNeeded() {
    if (query()) performSearch();
  }

  function updateDayType(newType) {
    selectedDayType.value = newType;
    refreshSearchIfNeeded();
  }

  watch(activeScheduleDataForToday, refreshSearchIfNeeded);

  return {
    searchQuery,
    searchResults,
    selectedDayType,
    hasSearched,
    filteredSuggestions,
    performSearch,
    updateDayType,
  };
}
