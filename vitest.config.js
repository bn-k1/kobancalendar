import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@data": fileURLToPath(new URL("./data", import.meta.url)),
      "@config": fileURLToPath(new URL("./config", import.meta.url)),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["src/__tests__/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,vue}"],
      exclude: [
        "src/__tests__/**",
        "src/main.js",
        "src/router/**",
        "src/**/*.spec.{js,vue}",
      ],
      // Ratchet floor, not an aspirational target: set a few points below the
      // measured coverage at the time this was added (stmts 37.57 / branch
      // 31.32 / funcs 38.16 / lines 38.17 on the then-current tree) so today's
      // suite passes with headroom, while still failing the build if coverage
      // silently regresses back toward 0%. Raise these as real coverage grows
      // — don't lower them to make a failing build pass.
      thresholds: {
        statements: 34,
        branches: 28,
        functions: 35,
        lines: 35,
      },
    },
  },
});
