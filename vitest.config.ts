import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    // This machine pays a large first-import cost per test file (slow disk);
    // 20s keeps slow module-graph loads from failing otherwise-passing tests.
    testTimeout: 20_000,
  },
});
