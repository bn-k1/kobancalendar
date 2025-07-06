<!-- src/components/SearchSection.vue -->
<template>
  <fieldset id="searchSection" class="control-group">
    <legend>検索</legend>
    
    <!-- Schedule type selector (only shown when schedule_update is set) -->
    <div v-if="showScheduleTypeSelector" class="form-group">
      <div class="radio-group">
        <label>
          <input 
            type="radio" 
            value="current" 
            v-model="selectedScheduleType"
            @change="handleScheduleTypeChange"
          />
          現交番表
        </label>
        <label>
          <input 
            type="radio" 
            value="next" 
            v-model="selectedScheduleType"
            @change="handleScheduleTypeChange"
          />
          新交番表
        </label>
      </div>
    </div>

    <!-- Day type selector -->
    <div class="form-group">
      <div class="radio-group">
        <label>
          <input 
            type="radio" 
            value="weekday" 
            v-model="selectedDayType"
            @change="handleDayTypeChange"
          />
          平日
        </label>
        <label>
          <input 
            type="radio" 
            value="saturday" 
            v-model="selectedDayType"
            @change="handleDayTypeChange"
          />
          土曜
        </label>
        <label>
          <input 
            type="radio" 
            value="holiday" 
            v-model="selectedDayType"
            @change="handleDayTypeChange"
          />
          日祝
        </label>
      </div>
    </div>

    <!-- Search input with autocomplete -->
    <div class="form-group">
      <div class="search-input-container">
        <input
          type="text"
          id="searchInput"
          v-model="searchQuery"
          @input="handleSearchInput"
          @focus="showSuggestions = true"
          @blur="handleBlur"
          placeholder="予定名で検索..."
          class="search-input"
          autocomplete="off"
        />
        
        <!-- Autocomplete suggestions -->
        <div v-if="showSuggestions && filteredSuggestions.length > 0" class="suggestions-dropdown">
          <div
            v-for="(suggestion, index) in filteredSuggestions"
            :key="index"
            @mousedown="selectSuggestion(suggestion)"
            class="suggestion-item"
            :class="{ 'highlighted': index === highlightedIndex }"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>
    </div>

    <!-- Search results -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">検索結果:</div>
      <div class="results-list">
        <div
          v-for="(result, index) in searchResults"
          :key="index"
          class="result-item"
        >
          <div class="result-subject">{{ result.subject }}</div>
          <div class="result-details">
            <span v-if="result.startTime && result.endTime" class="result-time">
              {{ result.startTime }} - {{ result.endTime }}
            </span>
            <span v-else-if="result.startTime" class="result-time">{{ result.startTime }}</span>
            <span v-else-if="result.endTime" class="result-time">{{ result.endTime }}</span>
            <span class="result-position">コマ{{ result.position }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- No results message -->
    <div v-else-if="searchQuery && hasSearched" class="no-results">
      該当する予定が見つかりませんでした
    </div>
  </fieldset>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useSearch } from '@/composables/useSearch';

// Composable for search functionality
const {
  searchQuery,
  searchResults,
  selectedScheduleType,
  selectedDayType,
  showScheduleTypeSelector,
  filteredSuggestions,
  hasSearched,
  performSearch,
  updateScheduleType,
  updateDayType
} = useSearch();

// Local state for UI
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);

// Handle search input
function handleSearchInput() {
  highlightedIndex.value = -1;
  performSearch();
}

// Handle schedule type change
function handleScheduleTypeChange() {
  updateScheduleType(selectedScheduleType.value);
  if (searchQuery.value.trim()) {
    performSearch();
  }
}

// Handle day type change
function handleDayTypeChange() {
  updateDayType(selectedDayType.value);
  if (searchQuery.value.trim()) {
    performSearch();
  }
}

// Select suggestion from dropdown
function selectSuggestion(suggestion) {
  searchQuery.value = suggestion;
  showSuggestions.value = false;
  performSearch();
}

// Handle input blur with delay to allow suggestion selection
function handleBlur() {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
}

// Handle keyboard navigation in suggestions
function handleKeydown(event) {
  if (!showSuggestions.value || filteredSuggestions.value.length === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredSuggestions.value.length - 1
      );
      break;
    case 'ArrowUp':
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1);
      break;
    case 'Enter':
      event.preventDefault();
      if (highlightedIndex.value >= 0) {
        selectSuggestion(filteredSuggestions.value[highlightedIndex.value]);
      }
      break;
    case 'Escape':
      showSuggestions.value = false;
      highlightedIndex.value = -1;
      break;
  }
}

// Watch for suggestions changes to reset highlighted index
watch(filteredSuggestions, () => {
  highlightedIndex.value = -1;
});
</script>

<style scoped>
.radio-group {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  font-size: 0.95rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.radio-group input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: var(--background-light);
  color: var(--text-color);
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.search-input:focus {
  border-color: var(--primary-light);
  outline: none;
  box-shadow: 0 0 0 3px rgba(72, 149, 239, 0.3);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--background-light);
  border: 1px solid var(--gray-300);
  border-top: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
  box-shadow: var(--shadow-md);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: 0.95rem;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background-color: var(--gray-100);
}

.search-results {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--gray-100);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--primary-color);
}

.results-header {
  font-weight: var(--font-weight-medium);
  color: var(--primary-color);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-sm);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.result-item {
  padding: var(--spacing-sm);
  background-color: var(--background-light);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--gray-200);
}

.result-subject {
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
  font-size: 0.95rem;
  margin-bottom: var(--spacing-xs);
}

.result-details {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.result-time {
  color: var(--gray-600);
  font-size: 0.85rem;
  background-color: var(--gray-100);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
}

.result-position {
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: var(--font-weight-medium);
  background-color: rgba(67, 97, 238, 0.1);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
}

.no-results {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  text-align: center;
  color: var(--gray-600);
  font-style: italic;
  background-color: var(--gray-100);
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
}

@media screen and (max-width: 768px) {
  .result-details {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}
</style>