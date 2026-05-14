import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// gh-pages builds are served from a repo subpath. Derive that subpath from
// config.json's `url` (the same value the QR code uses) so a forking depot only
// edits config — never this file. Non-gh-pages builds deploy at root.
function resolveBasePath(isGHPages) {
  if (!isGHPages) return "/";
  const configPath = fileURLToPath(
    new URL("./config/config.json", import.meta.url),
  );
  const { url } = JSON.parse(readFileSync(configPath, "utf8"));
  if (!url) {
    throw new Error(
      "gh-pages build needs config.json `url` to derive the base path",
    );
  }
  return new URL(url).pathname;
}

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
    base: resolveBasePath(isGHPages),
    server: {
      host: true,
      allowedHosts: [".ts.net"],
    },
    build: {
      outDir: isGHPages ? "docs" : "dist",
      sourcemap: false,
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
  };
});
