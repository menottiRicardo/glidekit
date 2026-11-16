// @vitest-environment node
import { writeRegistry } from '../../scripts/build-registry';
import { add } from '../../src/cli/commands/add';
import { diff } from '../../src/cli/commands/diff';
import { init } from '../../src/cli/commands/init';
import { list } from '../../src/cli/commands/list';
import {
  bundledRegistry,
  defaultConfig,
  detectAliasRoot,
  detectCss,
  readConfig,
  registryFor,
} from '../../src/cli/config';
import type { Logger } from '../../src/cli/logger';
import { detectPackageManager, installCommand, missingDependencies } from '../../src/cli/project';
import { collectDependencies, itemName, resolveTree } from '../../src/cli/registry';
import { diffLines, injectCssImport, rewriteImports } from '../../src/cli/transform';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

// The same registry the npm package ships, built fresh for these tests.
const registry = mkdtempSync(join(tmpdir(), 'glidekit-registry-'));
writeRegistry(registry);
const silent: Logger = { info() {}, success() {}, warn() {}, error() {} };
const dirs: string[] = [];

function project(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'glidekit-'));
  dirs.push(dir);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return dir;
}

const pkg = JSON.stringify({ dependencies: { react: '19.2.7', tailwindcss: '4.3.2' } });

function viteApp() {
  return project({
    'package.json': pkg,
    'tsconfig.app.json': `{
      // comments and trailing commas are allowed
      "compilerOptions": { "paths": { "@/*": ["./src/*"], }, },
    }`,
    'src/index.css': '@import "tailwindcss";\n\nbody { margin: 0; }\n',
  });
}

function nextApp() {
  return project({
    'package.json': pkg,
    'tsconfig.json': JSON.stringify({ compilerOptions: { paths: { '~/*': ['./*'] } } }),
    'app/globals.css': "@import 'tailwindcss';\n",
  });
}

const read = (dir: string, path: string) => readFileSync(join(dir, path), 'utf8');

afterAll(() => {
  rmSync(registry, { recursive: true, force: true });
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

describe('init', () => {
  it('sets up a Vite app: config, theme, css import and cn', async () => {
    const dir = viteApp();
    const config = await init({ cwd: dir, registry, install: false, logger: silent });
    expect(config.paths).toEqual({ ui: 'src/components/ui', lib: 'src/lib', hooks: 'src/hooks' });
    expect(config.aliases.ui).toBe('@/components/ui');
    expect(readConfig(dir)).toEqual(config);
    expect(read(dir, 'src/glidekit.css')).toContain('--color-primary');
    expect(read(dir, 'src/lib/cn.ts')).toContain('twMerge');
    expect(read(dir, 'src/index.css')).toBe(
      '@import "tailwindcss";\n@import "./glidekit.css";\n\nbody { margin: 0; }\n',
    );
  });

  it('is safe to run twice', async () => {
    const dir = viteApp();
    await init({ cwd: dir, registry, install: false, logger: silent });
    await init({ cwd: dir, registry, install: false, logger: silent });
    expect(read(dir, 'src/index.css').match(/glidekit\.css/g)).toHaveLength(1);
  });

  it('uses a custom alias and root folder (Next style)', async () => {
    const dir = nextApp();
    const config = await init({ cwd: dir, registry, install: false, logger: silent });
    expect(config.css).toBe('app/globals.css');
    expect(config.aliases).toEqual({ ui: '~/components/ui', lib: '~/lib', hooks: '~/hooks' });
    expect(existsSync(join(dir, 'app/glidekit.css'))).toBe(true);
    expect(existsSync(join(dir, 'lib/cn.ts'))).toBe(true);
  });

  it('explains what is missing', async () => {
    await expect(init({ cwd: project({}), registry, logger: silent })).rejects.toThrow(
      /package\.json/,
    );
    const noCss = project({ 'package.json': pkg, 'src/index.css': 'body {}' });
    await expect(init({ cwd: noCss, registry, logger: silent })).rejects.toThrow(/--css/);
  });
});

describe('add', () => {
  it('writes a component with its whole dependency tree', async () => {
    const dir = nextApp();
    await init({ cwd: dir, registry, install: false, logger: silent });
    const result = await add(['drawer'], { cwd: dir, install: false, logger: silent, yes: true });

    for (const file of [
      'components/ui/drawer.tsx',
      'components/ui/dialog.tsx',
      'components/ui/slot.tsx',
      'lib/motion.ts',
      'lib/props.ts',
      'hooks/use-preset.ts',
    ]) {
      expect(result.written).toContain(file);
    }
    const drawer = read(dir, 'components/ui/drawer.tsx');
    expect(drawer).toContain("from '~/components/ui/dialog'");
    expect(drawer).toContain("from '~/lib/cn'");
    expect(drawer).not.toContain('@/');
    expect(result.dependencies).toEqual([
      '@zag-js/dialog@^1.42.0',
      '@zag-js/react@^1.42.0',
      'clsx@^2.1.1',
      'motion@^12.42.2',
      'tailwind-merge@^3.6.0',
    ]);
  });

  it('keeps local edits unless asked to overwrite', async () => {
    const dir = viteApp();
    await init({ cwd: dir, registry, install: false, logger: silent });
    await add(['badge'], { cwd: dir, install: false, logger: silent });
    writeFileSync(join(dir, 'src/components/ui/badge.tsx'), '// mine\n');

    const declined = await add(['badge'], {
      cwd: dir,
      install: false,
      logger: silent,
      confirm: async () => false,
    });
    expect(declined.skipped).toContain('src/components/ui/badge.tsx');
    expect(read(dir, 'src/components/ui/badge.tsx')).toBe('// mine\n');

    const kept = await add(['badge'], { cwd: dir, install: false, logger: silent, yes: true });
    expect(kept.written).toEqual([]);

    const replaced = await add(['badge'], {
      cwd: dir,
      install: false,
      logger: silent,
      overwrite: true,
    });
    expect(replaced.written).toContain('src/components/ui/badge.tsx');
    expect(read(dir, 'src/components/ui/badge.tsx')).toContain('badgeVariants');
  });

  it('supports dry runs and a custom path', async () => {
    const dir = viteApp();
    await init({ cwd: dir, registry, install: false, logger: silent });
    const dry = await add(['button'], { cwd: dir, install: false, logger: silent, dryRun: true });
    expect(dry.written).toContain('src/components/ui/button.tsx');
    expect(existsSync(join(dir, 'src/components/ui/button.tsx'))).toBe(false);

    await add(['button'], { cwd: dir, install: false, logger: silent, path: 'src/ui' });
    expect(existsSync(join(dir, 'src/ui/button.tsx'))).toBe(true);
  });

  it('reports unknown components and missing setup', async () => {
    const dir = viteApp();
    await expect(add(['button'], { cwd: dir, logger: silent })).rejects.toThrow(/init/);
    await init({ cwd: dir, registry, install: false, logger: silent });
    await expect(add(['nope'], { cwd: dir, install: false, logger: silent })).rejects.toThrow(
      /Not found.*nope/,
    );
  });
});

describe('list and diff', () => {
  it('lists components but not internal helpers', async () => {
    const names = await list({ cwd: viteApp(), registry, logger: silent });
    expect(names).toContain('dialog');
    expect(names).toContain('text-reveal');
    expect(names).not.toContain('slot');
    expect(names).not.toContain('cn');
  });

  it('shows local changes against the registry', async () => {
    const dir = viteApp();
    await init({ cwd: dir, registry, install: false, logger: silent });
    expect((await diff('kbd', { cwd: dir, logger: silent }))[0]!.missing).toBe(true);
    await add(['kbd'], { cwd: dir, install: false, logger: silent });
    expect((await diff('kbd', { cwd: dir, logger: silent }))[0]!.changes).toEqual([]);

    const file = join(dir, 'src/components/ui/kbd.tsx');
    writeFileSync(file, read(dir, 'src/components/ui/kbd.tsx').replace('h-5', 'h-6'));
    const [result] = await diff('kbd', { cwd: dir, logger: silent });
    expect(result!.changes.some((line) => line.startsWith('-') && line.includes('h-6'))).toBe(true);
    expect(result!.changes.some((line) => line.startsWith('+') && line.includes('h-5'))).toBe(true);
  });
});

describe('helpers', () => {
  it('resolves dependencies before dependents, once each', async () => {
    const items = await resolveTree(registry, ['drawer', 'dialog'], process.cwd());
    const names = items.map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names.indexOf('dialog')).toBeLessThan(names.indexOf('drawer'));
    expect(names.indexOf('cn')).toBeLessThan(names.indexOf('dialog'));
    expect(collectDependencies(items)).toContain('@zag-js/dialog@^1.42.0');
  });

  it('normalizes item references', () => {
    expect(itemName('dialog')).toBe('dialog');
    expect(itemName('use-preset.json')).toBe('use-preset');
  });

  it('uses the registry bundled in the package unless told otherwise', () => {
    expect(bundledRegistry()).toMatch(/[\\/]registry$/);
    expect(registryFor(null)).toBe(bundledRegistry());
    expect(registryFor({ registry: 'vendor/r' })).toBe('vendor/r');
    expect(registryFor({ registry: 'vendor/r' }, 'other')).toBe('other');
  });

  it('only stores a registry folder in glidekit.json when one is given', () => {
    const dir = viteApp();
    expect(defaultConfig(dir, 'src/index.css')).not.toHaveProperty('registry');
    expect(defaultConfig(dir, 'src/index.css', 'vendor/r').registry).toBe('vendor/r');
  });

  it('rewrites only the aliases that differ', () => {
    const source = `import { cn } from '@/lib/cn';\nimport { Slot } from "@/components/ui/slot";\nimport x from '@/other';`;
    expect(rewriteImports(source, { ui: '#ui', lib: '~/lib', hooks: '@/hooks' })).toBe(
      `import { cn } from '~/lib/cn';\nimport { Slot } from "#ui/slot";\nimport x from '@/other';`,
    );
  });

  it('adds the css import once, after Tailwind or at the top', () => {
    expect(injectCssImport('@import "tailwindcss";\n.a{}')).toBe(
      '@import "tailwindcss";\n@import "./glidekit.css";\n.a{}',
    );
    expect(injectCssImport('.a{}')).toBe('@import "./glidekit.css";\n.a{}');
    const once = injectCssImport('@import "tailwindcss";');
    expect(injectCssImport(once)).toBe(once);
  });

  it('diffs lines', () => {
    expect(diffLines('a\nb\nc', 'a\nc\nd')).toEqual(['- b', '+ d']);
    expect(diffLines('same', 'same')).toEqual([]);
  });

  it('detects project details', () => {
    expect(detectAliasRoot(viteApp())).toEqual({ prefix: '@', dir: 'src' });
    expect(detectCss(nextApp())).toBe('app/globals.css');
    expect(detectPackageManager(project({ 'pnpm-lock.yaml': '' }))).toBe('pnpm');
    expect(detectPackageManager(project({ 'yarn.lock': '' }))).toBe('yarn');
    expect(installCommand('npm', ['a'])).toEqual(['npm', ['install', 'a']]);
    expect(installCommand('bun', ['a'])).toEqual(['bun', ['add', 'a']]);
    const dir = project({ 'package.json': JSON.stringify({ dependencies: { motion: '1' } }) });
    expect(missingDependencies(dir, ['motion@^12.0.0', '@zag-js/react@^1.0.0'])).toEqual([
      '@zag-js/react@^1.0.0',
    ]);
  });
});
