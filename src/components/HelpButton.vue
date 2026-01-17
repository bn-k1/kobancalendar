<template>
  <a
    class="help-link"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="ariaLabel"
    :title="title"
  >
    <HelpIcon />
  </a>
</template>

<script setup>
import HelpIcon from "@/components/Icons/HelpIcon.vue";

defineProps({
  href: {
    type: String,
    default: "https://github.com/bn-k1/kobancalendar?tab=readme-ov-file#kobancalendar",
  },
  ariaLabel: {
    type: String,
    default: "使い方ガイドを開く",
  },
  title: {
    type: String,
    default: "使い方ガイド",
  },
});
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
