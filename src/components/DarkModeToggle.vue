<!-- src/components/DarkModeToggle.vue -->
<template>
  <button
    class="dark-toggle"
    @click="toggleDarkMode"
    :aria-pressed="isDark"
    aria-label="ダークモード切替"
  >
    {{ isDark ? "☀️" : "🌙" }}
  </button>
</template>

<script setup>
import { ref, onMounted } from "vue";

const isDark = ref(false);

onMounted(() => {
  if (localStorage.getItem("dark-mode") === "on") {
    document.documentElement.classList.add("dark");
    isDark.value = true;
  }
});

function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
  localStorage.setItem("dark-mode", isDark.value ? "on" : "off");
}
</script>

<style scoped>
.dark-toggle {
  background-color: rgba(255, 255, 255, 0.12);
  border: none;
  color: var(--text-light);
  width: 40px;
  height: 40px;
  min-height: unset;
  border-radius: 50%;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
  padding: 0;
  box-shadow: none;
}

.dark-toggle:hover {
  background-color: rgba(255, 255, 255, 0.22);
  transform: none;
  box-shadow: none;
}
</style>
