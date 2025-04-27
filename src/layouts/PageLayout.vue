<!-- src/layouts/PageLayout.vue -->
<template>
  <div class="page-layout">
    <header>
      <h1>{{ pageTitle }}</h1>
    </header>

    <main>
      <slot></slot>
    </main>

    <footer>
      <p>
        KobanCalendar -
        <a
          href="https://github.com/bn-k1/kobancalendar#README"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        -
        <a v-if="isHomePage" href="/kobancalendar/#/meetup">🍻</a>
        <a v-if="isMeetupPage" href="/kobancalendar/#/">🚨</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

const route = useRoute();

// Detect current page
const isHomePage = computed(() => route.path === "/" || route.path === "");
const isMeetupPage = computed(() => route.path === "/meetup");

// Page title based on route
const pageTitle = computed(() => {
  // If title is provided via props, use it
  if (props.title) {
    return props.title;
  }

  // Otherwise determine based on route
  return isMeetupPage.value ? "飲みに行くンダー🍻" : "交番カレンダー🚨";
});
</script>

<style scoped>
/* PageLayout-specific styles can be added here if needed */
</style>
