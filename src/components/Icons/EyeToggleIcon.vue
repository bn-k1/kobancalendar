<!-- src/components/Icons/EyeToggleIcon.vue -->
<template>
  <svg v-if="hidden" class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 7l16 10M3 12c2.5-4 6-6 9-6 3.5 0 6.5 2 9 6-1 2-2.2 3.6-3.7 4.7"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M10.2 8.2a4 4 0 015.6 5.6"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </svg>
  <svg v-else class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M3 12c2.8-4.2 6.2-6.3 9-6.3S18.2 7.8 21 12c-2.8 4.2-6.2 6.3-9 6.3S5.8 16.2 3 12z"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6" />
  </svg>
</template>

<script setup>
defineProps({
  hidden: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.eye-icon {
  width: 18px;
  height: 18px;
  display: block;
}
</style>
