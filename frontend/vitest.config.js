import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'c8', // ← uporabi c8 namesto v8
      reporter: ['text', 'lcov'],
    },
    passWithNoTests: true,
  },
});
