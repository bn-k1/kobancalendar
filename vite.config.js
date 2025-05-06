import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@data': fileURLToPath(new URL('./data', import.meta.url)),
      '@config': fileURLToPath(new URL('./config', import.meta.url)),
    }
  },
  assetsInclude: ["./data/*.csv"],
  // Base path for GitHub Pages - repository name
  base: '/kobancalendar/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'calendar': ['@fullcalendar/vue3', '@fullcalendar/daygrid', '@fullcalendar/interaction'],
          'utils': ['dayjs', 'ical-generator', 'japanese-holidays', 'papaparse']
        }
      }
    }
  },
});
