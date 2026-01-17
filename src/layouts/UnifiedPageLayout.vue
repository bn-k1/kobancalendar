<!-- src/layouts/UnifiedPageLayout.vue -->
<template>
  <div class="page-layout">
    <header>
      <h1 @click="handleTitleClick" class="clickable-title">{{ pageTitle }}</h1>
      <div class="header-controls">
        <a v-if="isHomePage" class="mode-link" :href="meetupLink" aria-label="飲み会モードへ">🍻</a>
        <a v-if="isMeetupPage" class="mode-link" href="/kobancalendar/#/" aria-label="勤務モードへ">🚨</a>
        <a
          class="help-link"
          href="https://github.com/bn-k1/kobancalendar?tab=readme-ov-file#kobancalendar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="使い方ガイドを開く"
          title="使い方ガイド"
        >
          <HelpIcon />
        </a>
        <ShareButton />
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
        <section class="search-section">
          <slot name="search"></slot>
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
          href="https://github.com/bn-k1/kobancalendar"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
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
import ShareButton from "@/components/ShareButton.vue";
import QrButton from "@/components/QrButton.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import HelpIcon from "@/components/icons/HelpIcon.vue";

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

// Handle title click - navigate to respective clean top page
function handleTitleClick() {
  if (isHomePage.value) {
    window.location.href = '/kobancalendar/#/';
  } else if (isMeetupPage.value) {
    window.location.href = '/kobancalendar/#/meetup';
  } else {
    window.location.href = '/kobancalendar/#/';
  }
}
</script>

<style scoped>
.header-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.mode-link {
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
  font-size: 1rem;
}

.mode-link:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

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

.clickable-title {
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  margin: calc(-1 * var(--spacing-xs)) calc(-1 * var(--spacing-sm));
}

.clickable-title:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.clickable-title:active {
  transform: translateY(0);
}
</style>
