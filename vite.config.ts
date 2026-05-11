/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['**/node_modules/**', '**/test/**', '**/*.config.*'],
    },
  },
  build: {
    sourcemap: true,
    target: 'es2022',
  },
});
