<template>
  <a
    class="help-link"
    :href="manualUrl"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="使い方ガイドを開く"
    title="使い方ガイド"
  >
    <HelpIcon />
  </a>
</template>

<script setup>
import HelpIcon from "@/components/Icons/HelpIcon.vue";

const manualUrl = `${import.meta.env.BASE_URL}manual.html`;
</script>

<style scoped>
.help-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.12);
  color: var(--text-light);
  text-decoration: none;
  transition: background var(--transition-fast);
}

.help-link:hover {
  background-color: rgba(255, 255, 255, 0.22);
}
</style>
