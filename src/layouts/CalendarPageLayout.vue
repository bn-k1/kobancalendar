<!-- src/layouts/CalendarPageLayout.vue -->
<template>
  <PageLayout title="交番カレンダー🚨">
    <div class="calendar-page-layout">
      <section class="control-section">
        <slot name="controls"></slot>
      </section>

      <section class="calendar-section">
        <slot name="calendar"></slot>
      </section>

      <section class="export-section">
        <slot name="export"></slot>
      </section>
    </div>
  </PageLayout>
</template>

<script setup>
import PageLayout from "./PageLayout.vue";
</script>

<style scoped>
.calendar-page-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.control-section,
.calendar-section,
.export-section {
  width: 100%;
}

.calendar-section {
  flex: 1;
}

@media screen and (max-width: 768px) {
  .control-section {
    padding: 0;
  }
}
</style>
