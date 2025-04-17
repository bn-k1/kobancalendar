import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url))
    }
  },
  // CSVファイルを適切に読み込むための設定
  assetsInclude: ['**/*.csv']
});