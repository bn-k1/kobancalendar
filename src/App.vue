<template>
  <header>
    <h1>{{ pageTitle }}</h1>
    <nav>
      <router-link to="/">交番カレンダー🚨</router-link>
      <router-link to="/meetup">飲みに行くンダー🍻</router-link>
    </nav>
  </header>

  <main>
    <router-view />
  </main>

  <footer>
    <p>
      KobanCalendar -
      <a href="https://github.com/bn-k1/kobancalendar#README" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
    </p>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// ルートに基づいてページタイトルを動的に変更
const pageTitle = computed(() => {
  return route.path === '/meetup' ? '飲みに行くンダー🍻' : '交番カレンダー🚨';
});
</script>

<style>
/* ここでApp固有のスタイルを追加できます */
</style>