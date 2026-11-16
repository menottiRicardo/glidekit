import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { cli: 'src/cli/index.ts' },
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  clean: true,
  sourcemap: true,
  banner: { js: '#!/usr/bin/env node' },
  dts: false,
  // Bundle the CLI's own libraries so the package has no runtime dependencies.
  noExternal: ['commander', 'picocolors'],
});
