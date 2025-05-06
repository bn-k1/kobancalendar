// src/router/index.js
import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
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
];

const router = createRouter({
  history: createWebHashHistory("/kobancalendar/"),
  routes,
});

// Handle page title updates
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "KobanCalendar";
  next();
});

export default router;
