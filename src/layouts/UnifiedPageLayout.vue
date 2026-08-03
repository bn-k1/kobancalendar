<!-- src/layouts/UnifiedPageLayout.vue -->
<template>
  <div class="page-layout">
    <header>
      <div class="header-top">
        <h1 class="clickable-title" @click="handleTitleClick">
          {{ pageTitle }}
        </h1>
        <div class="header-controls">
          <a
            v-if="isHomePage"
            class="mode-link"
            :href="`${baseUrl}#/meetup`"
            aria-label="飲み会モードへ"
            >🍻</a
          >
          <a
            v-if="isMeetupPage"
            class="mode-link"
            :href="`${baseUrl}#/`"
            aria-label="勤務モードへ"
            >🚨</a
          >
          <HelpButton />
          <ShareButton />
          <QrButton />
          <DarkModeToggle />
        </div>
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
        <section v-if="showResults" class="results-section">
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
import ShareButton from "@/components/ShareButton.vue";
import QrButton from "@/components/QrButton.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import HelpButton from "@/components/HelpButton.vue";

// Footer "GitHub" link is intentionally STATIC to the upstream project, not the
// running fork: forks/template instances are independent repos and the footer is
// project attribution ("this is KobanCalendar"), not a view-source link for the
// deployed instance. Staying upstream is the zero-config default — nothing to
// edit after forking, and it's consistent across github.io / custom domain / dev.

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

const emit = defineEmits(["title-click"]);

const route = useRoute();

// Deploy base path ("/" or a gh-pages repo subpath); set by Vite from config.json.
const baseUrl = import.meta.env.BASE_URL;

// Detect current page
const isHomePage = computed(() => route.path === "/" || route.path === "");
const isMeetupPage = computed(() => route.path === "/meetup");

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

function handleTitleClick() {
  emit("title-click");
}
</script>

<style scoped>
header {
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Mode navigation link (🍻 / 🚨) */
.mode-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-light);
  text-decoration: none;
  transition: background var(--transition-fast);
  font-size: 1.2rem;
  line-height: 1;
}

.mode-link:hover {
  background: rgba(255, 255, 255, 0.22);
}

.clickable-title {
  cursor: pointer;
  transition: opacity var(--transition-fast);
  user-select: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  margin: calc(-1 * var(--spacing-xs)) calc(-1 * var(--spacing-sm));
}

.clickable-title:hover {
  opacity: 0.8;
}

.clickable-title:active {
  opacity: 0.6;
}
</style>
