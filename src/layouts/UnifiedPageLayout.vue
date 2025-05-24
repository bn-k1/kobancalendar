<!-- src/layouts/UnifiedPageLayout.vue -->
<template>
  <div class="page-layout">
    <header>
      <h1>{{ pageTitle }}</h1>
      <div class="header-controls">
        <QrButton />
        <DarkModeToggle />
      </div>
    </header>
    <main>
      <!-- Calendar layout -->
      <div v-if="layout === 'calendar'" class="calendar-page-layout">
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
      <!-- Meetup layout -->
      <div v-else-if="layout === 'meetup'" class="meetup-page-layout">
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
      <!-- Default layout -->
      <div v-else>
        <slot></slot>
      </div>
    </main>
    <footer>
      <p>
        KobanCalendar -
        <a
          href="https://github.com/bn-k1/kobancalendar?tab=readme-ov-file#kobancalendar"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        -
        <a v-if="isHomePage" :href="meetupLink">🍻</a>
        <a v-if="isMeetupPage" href="/kobancalendar/#/">🚨</a>
      </p>
    </footer>
  </div>
</template>
<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { formatAsISODate } from "@/utils/date";
import { useSchedule } from "@/composables/useSchedule";
import { useCalendar } from "@/composables/useCalendar";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import QrButton from "@/components/QrButton.vue";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  layout: {
    type: String,
    default: "default", // 'calendar', 'meetup', or 'default'
  },
  showResults: {
    type: Boolean,
    default: false,
  },
});

const { activeBaseDate } = useSchedule();
const { startPosition } = useCalendar();
const route = useRoute();

// Detect current page
const isHomePage = computed(() => route.path === "/" || route.path === "");
const isMeetupPage = computed(() => route.path === "/meetup");

// Generate meetup link with parameters from store
const meetupLink = computed(() => {
  let link = "/kobancalendar/";
  const params = [];

  if (activeBaseDate.value) {
    params.push(`baseDate=${formatAsISODate(activeBaseDate.value)}`);
  }

  if (startPosition.value) {
    params.push(`participants=${startPosition.value}`);
  }

  if (params.length > 0) {
    link += `?${params.join("&")}#/meetup`;
  }

  return link;
});

// Page title based on route or props
const pageTitle = computed(() => {
  if (props.title) return props.title;
  if (props.layout === "calendar" || isHomePage.value) {
    return "KobanCalendar🚨";
  }
  if (props.layout === "meetup" || isMeetupPage.value) {
    return "NominiIkundar🍻";
  }
  return "KobanCalendar🚨";
});
</script>

<style scoped>
.header-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
</style>
