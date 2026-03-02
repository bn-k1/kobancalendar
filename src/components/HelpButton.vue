<template>
  <a
    class="help-link"
    href="./manual.html"
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
</script>

<style scoped>
.help-link {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--text-light);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.help-link:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
</style>
