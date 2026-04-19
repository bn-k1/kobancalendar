<!-- src/layouts/UnifiedPageLayout.vue -->
<template>
  <div class="page-layout">
    <header>
      <div class="header-top">
        <h1 @click="handleTitleClick" class="clickable-title">{{ pageTitle }}</h1>
        <div class="header-controls">
          <a v-if="isHomePage" class="mode-link" href="/kobancalendar/#/meetup" aria-label="飲み会モードへ">🍻</a>
          <a v-if="isMeetupPage" class="mode-link" href="/kobancalendar/#/" aria-label="勤務モードへ">🚨</a>
          <HelpButton />
          <ShareButton />
          <QrButton />
          <DarkModeToggle />
        </div>
      </div>
    </header>
    <div v-if="showCafeteriaMenu" class="cafeteria-menu-retro" :class="{ 'is-unavailable': !hasTodayMenu }">
      <p class="retro-title">本日の食堂メニュー</p>
      <template v-if="hasTodayMenu">
        <div class="retro-row">
          <span class="retro-item">A定食: {{ todayMenu.a }} ｜ B定食: {{ todayMenu.b }}</span>
        </div>
      </template>
      <p v-else class="retro-empty">本日のメニューは未登録です</p>
      <template v-if="hasTomorrowMenu">
        <div class="retro-row retro-row--tomorrow">
          <span class="retro-label">明日</span>
          <span class="retro-item">{{ tomorrowMenu.a }} ｜ {{ tomorrowMenu.b }}</span>
        </div>
      </template>
    </div>
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
import { formatAsISODate, today, addDays } from "@/utils/date";
import ShareButton from "@/components/ShareButton.vue";
import QrButton from "@/components/QrButton.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import HelpButton from "@/components/HelpButton.vue";
import menuData from "@data/menu/menu.json";
import config from "@config/config.json";

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

const todayMenu = computed(() => {
  const todayKey = formatAsISODate(today());
  const todaysMenu = menuData[todayKey];

  if (!todaysMenu) {
    return null;
  }

  return {
    a: todaysMenu.a || "未定",
    b: todaysMenu.b || "未定",
  };
});
const hasTodayMenu = computed(() => todayMenu.value !== null);

const tomorrowMenu = computed(() => {
  const tomorrowKey = formatAsISODate(addDays(today(), 1));
  const m = menuData[tomorrowKey];
  if (!m) return null;
  return { a: m.a || "未定", b: m.b || "未定" };
});
const hasTomorrowMenu = computed(() => tomorrowMenu.value !== null);
const hasAnyMenuData = computed(() => {
  return menuData && typeof menuData === "object" && Object.keys(menuData).length > 0;
});
const showCafeteriaMenu = computed(() => {
  return props.layout !== "meetup" && !isMeetupPage.value && hasAnyMenuData.value;
});

function handleTitleClick() {
  emit("title-click");
}
</script>

<style scoped>
header {
  flex-direction: column;
  align-items: stretch;
  gap: var(--spacing-xs);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.cafeteria-menu-retro {
  width: 100%;
  background: var(--background-light);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  padding: var(--spacing-sm) var(--spacing-lg);
}

.retro-title {
  margin: 0 0 var(--spacing-xs);
  font-weight: var(--font-weight-bold);
  font-size: 1rem;
  color: var(--gray-700);
}

.retro-row {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.retro-item {
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
}

.retro-empty {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray-600);
}

.retro-row--tomorrow {
  margin-top: var(--spacing-xs);
  opacity: 0.55;
  font-size: 0.88rem;
}

.retro-label {
  font-size: 0.8rem;
  color: var(--text-color);
  margin-right: var(--spacing-xs);
  white-space: nowrap;
}

.cafeteria-menu-retro.is-unavailable {
  background: var(--gray-100);
}

.mode-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  text-decoration: none;
  transition: all var(--transition-fast);
  font-size: 1.6rem;
  line-height: 1;
  padding: 0;
}

.mode-link:hover {
  transform: translateY(-2px);
  opacity: 0.9;
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

@media screen and (max-width: 768px) {
  .header-top {
    gap: var(--spacing-sm);
  }

  .cafeteria-menu-retro {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .retro-title {
    font-size: 0.92rem;
  }

  .retro-row {
    font-size: 0.88rem;
  }

  .retro-item {
    display: inline-block;
    width: 100%;
    overflow-wrap: anywhere;
  }
}
</style>
