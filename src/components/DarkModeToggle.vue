<template>
  <button 
    id="darkModeToggle" 
    class="dark-mode-toggle" 
    @click="toggleDarkMode" 
    :title="isDarkMode ? '明るいモードに切り替え' : '暗いモードに切り替え'"
    aria-label="ダークモード切り替え"
  >
    <span v-if="isDarkMode">🌞</span>
    <span v-else>🌙</span>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

// State for dark mode
const isDarkMode = ref(false);

// Toggle dark mode
function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  
  // Apply dark mode to document
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.documentElement.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
}

// Initialize dark mode based on user preference
onMounted(() => {
  // Check local storage first
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'enabled') {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark-mode');
  } else if (savedMode === null) {
    // If no saved preference, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode.value = prefersDark;
    if (prefersDark) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'enabled');
    }
  }
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (localStorage.getItem('darkMode') === null) {
      isDarkMode.value = event.matches;
      if (event.matches) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    }
  });
});
</script>

<style scoped>
.dark-mode-toggle {
  background: transparent;
  border: none;
  color: var(--text-light);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  transition: all var(--transition-normal);
}

.dark-mode-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
  box-shadow: none;
}

.dark-mode-toggle:active {
  transform: scale(0.95);
}
</style>
