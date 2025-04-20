<template>
  <header>
    <h1>{{ pageTitle }}</h1>
  </header>

  <main>
    <router-view />
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
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// 現在のページを判定
const isHomePage = computed(() => route.path === "/" || route.path === "");
const isMeetupPage = computed(() => route.path === "/meetup");

// ルートに基づいてページタイトルを動的に変更
const pageTitle = computed(() => {
  return isMeetupPage.value ? "飲みに行くンダー🍻" : "交番カレンダー🚨";
});
</script>

<style>
/* ここでApp固有のスタイルを追加できます */
</style>
