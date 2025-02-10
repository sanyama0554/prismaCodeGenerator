import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src/test/extension.test.ts'], // VSCode拡張のテストは除外
    environment: 'node',
  },
}); 