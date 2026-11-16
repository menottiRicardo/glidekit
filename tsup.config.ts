import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { cli: 'src/cli/index.ts' },
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  clean: true,
  sourcemap: true,
  banner: {
    // The bundled libraries are CommonJS; give them a require() for Node built-ins.
    js: [
      '#!/usr/bin/env node',
      "import { createRequire as __createRequire } from 'node:module';",
      'const require = __createRequire(import.meta.url);',
    ].join('\n'),
  },
  dts: false,
  // Bundle the CLI's own libraries so the package has no runtime dependencies.
  noExternal: ['commander', 'picocolors'],
});
