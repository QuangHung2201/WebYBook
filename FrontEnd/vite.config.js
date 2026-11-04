import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
    // Không watch file mô hình trong public: khi copy/ghi đè file .glb,
    // Windows có thể khóa file tạm thời và làm Vite crash với lỗi EBUSY.
    watch: {
      ignored: ['**/public/**/*.glb'],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
