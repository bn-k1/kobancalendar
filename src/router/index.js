import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/meetup",
    name: "meetup",
    // 動的インポートによる遅延ローディング
    component: () => import("../views/MeetupView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory("/kobancalendar/"),
  routes,
});

export default router;
