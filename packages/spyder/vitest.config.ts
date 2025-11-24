import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    environment: 'node',
    testTimeout: 10000,
  },
});
