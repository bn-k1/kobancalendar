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