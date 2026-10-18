import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default defineConfig((env) =>
  mergeConfig(viteConfig(env), {
    test: {
      setupFiles: ["src/__tests__/setup.js"],
    },
  }),
);
