import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    // This machine pays a large first-import cost per test file (slow disk);
    // 20s keeps slow module-graph loads from failing otherwise-passing tests.
    testTimeout: 20_000,
    coverage: {
      provider: 'v8',
      include: ['lib/scheduling/**', 'lib/ical/**'],
      // Each folder must reach 80 percent on its own, so one cannot carry the other.
      thresholds: {
        'lib/scheduling/**': {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        'lib/ical/**': {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  },
});
