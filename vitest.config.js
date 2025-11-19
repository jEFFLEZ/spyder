import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.*', 'src/**/__tests__/**/*.test.*', 'extensions/**/src/**/*.test.*'],
    exclude: ['**/out/**', '**/dist/**', 'node_modules/**'],
    setupFiles: ['./vitest.setup.js'],
    environment: 'node',
    threads: false,
  },
});
