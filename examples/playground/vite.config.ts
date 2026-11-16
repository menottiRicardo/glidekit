import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const registry = (path: string) =>
  fileURLToPath(new URL(`../../registry/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@\/lib\/(.*)$/, replacement: registry('lib/$1') },
      { find: /^@\/hooks\/(.*)$/, replacement: registry('hooks/$1') },
      { find: /^@\/components\/ui\/(.*)$/, replacement: registry('ui/$1') },
    ],
  },
});
