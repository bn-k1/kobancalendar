import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const path = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig(({ command, isPreview }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path("./src"),
      "@data": path("./data"),
      "@config": path("./config"),
    },
  },
  // Served from https://bn-k1.github.io/kobancalendar/
  base: command === "build" || isPreview ? "/kobancalendar/" : "/",
  server: {
    host: true,
    allowedHosts: [".ts.net"],
  },
  build: {
    outDir: "docs",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
          calendar: ["@fullcalendar/vue3", "@fullcalendar/daygrid"],
          utils: ["dayjs", "japanese-holidays"],
        },
      },
    },
  },
}));
