// src/router/index.js
import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: {
      title: "交番カレンダー🚨",
    },
  },
  {
    path: "/meetup",
    name: "meetup",
    // Lazy loading for better performance
    component: () => import("../views/MeetupView.vue"),
    meta: {
      title: "飲みに行くンダー🍻",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory("/kobancalendar/"),
  routes,
});

// Handle page title updates
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "交番カレンダー";
  next();
});

export default router;
