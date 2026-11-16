import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dir = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/lib\/(.*)$/, replacement: dir('./registry/lib/$1') },
      { find: /^@\/hooks\/(.*)$/, replacement: dir('./registry/hooks/$1') },
      { find: /^@\/components\/ui\/(.*)$/, replacement: dir('./registry/ui/$1') },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    testTimeout: 15000,
  },
});
