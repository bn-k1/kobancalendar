<!-- src/layouts/MeetupPageLayout.vue -->
<template>
  <PageLayout title="飲みに行くンダー🍻">
    <div class="meetup-page-layout">
      <section class="search-controls-section">
        <slot name="search-controls"></slot>
      </section>
      
      <section class="participants-section">
        <slot name="participants"></slot>
      </section>
      
      <section class="search-button-section">
        <slot name="search-button"></slot>
      </section>
      
      <section class="results-section" v-if="showResults">
        <slot name="results"></slot>
      </section>
    </div>
  </PageLayout>
</template>

<script setup>
import PageLayout from './PageLayout.vue';

defineProps({
  showResults: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.meetup-page-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.search-controls-section,
.participants-section,
.search-button-section,
.results-section {
  width: 100%;
}

.search-button-section {
  display: flex;
  justify-content: center;
}

@media screen and (max-width: 768px) {
  .search-controls-section,
  .participants-section {
    padding: 0;
  }
}
</style>