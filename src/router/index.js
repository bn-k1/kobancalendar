// src/router/index.js
import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: {
      title: "KobanCalendar🚨",
    },
  },
  {
    path: "/meetup",
    name: "meetup",
    // Lazy loading for better performance
    component: () => import("../views/MeetupView.vue"),
    meta: {
      title: "NominiIkundar🍻",
    },
  },
  {
    path: "/admin",
    name: "admin",
    // Admin-only; lazy-loaded and not linked from the user-facing UI.
    component: () => import("../views/AdminView.vue"),
    meta: {
      title: "KobanCalendar 管理画面🔧",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

// Handle page title updates
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "KobanCalendar";
  next();
});

export default router;
