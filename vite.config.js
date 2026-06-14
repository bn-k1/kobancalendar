import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// gh-pages builds are served from a repo subpath. CI passes that subpath via the
// BASE_PATH env var (derived from the repo name) so a forking office needs zero
// config. Falls back to an optional config.json `url` (custom domains / local
// gh-pages builds), then to root. Non-gh-pages builds deploy at root.
function resolveBasePath(isGHPages) {
  if (!isGHPages) return "/";
  if (process.env.BASE_PATH) return process.env.BASE_PATH;
  try {
    const configPath = fileURLToPath(
      new URL("./config/config.json", import.meta.url),
    );
    const { url } = JSON.parse(readFileSync(configPath, "utf8"));
    if (url) return new URL(url).pathname;
  } catch {
    // config.url is optional — fall through to root.
  }
  return "/";
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
