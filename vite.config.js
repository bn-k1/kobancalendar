import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const isGHPages = mode === "gh-pages";

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@data": fileURLToPath(new URL("./data", import.meta.url)),
        "@config": fileURLToPath(new URL("./config", import.meta.url)),
      },
    },
    base: isGHPages ? "/kobancalendar/" : "/",
    build: {
      outDir: isGHPages ? "docs" : "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router", "pinia"],
            calendar: [
              "@fullcalendar/vue3",
              "@fullcalendar/daygrid",
            ],
            utils: [
              "dayjs",
              "ical-generator",
              "japanese-holidays",
            ],
          },
        },
      },
    },
  };
});
