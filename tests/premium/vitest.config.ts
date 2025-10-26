import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        'tests/**',
      ],
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
      all: true,
    },
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../public/variant-2'),
      '@js': path.resolve(__dirname, '../../public/variant-2/js'),
      '@css': path.resolve(__dirname, '../../public/variant-2/css'),
      '@tests': path.resolve(__dirname, '../'),
    },
  },
});
