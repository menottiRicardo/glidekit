/**
 * Builds the component registry that ships inside the npm package.
 *
 *   dist/registry/index.json   every item without file contents (used by `glidekit list`)
 *   dist/registry/<name>.json  one item per component, with file contents inlined
 *
 * npm dependencies and registry dependencies are read from each file's imports,
 * so they can never drift from the code. Pass `--out <dir>` to write elsewhere.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { meta } from './registry-meta';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  devDependencies: Record<string, string>;
};

type ItemType = 'ui' | 'lib' | 'hook' | 'style';

interface RegistryFile {
  path: string;
  type: ItemType;
  target?: string;
  content?: string;
}

export interface RegistryItem {
  name: string;
  type: ItemType;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}

const SOURCES: { dir: string; type: ItemType }[] = [
  { dir: 'registry/lib', type: 'lib' },
  { dir: 'registry/hooks', type: 'hook' },
  { dir: 'registry/ui', type: 'ui' },
];

const IMPORT = /^\s*import\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/gm;

/** Splits a file's imports into npm packages and other registry items. */
export function analyzeImports(source: string): { packages: string[]; items: string[] } {
  const packages = new Set<string>();
  const items = new Set<string>();
  for (const match of source.matchAll(IMPORT)) {
    const spec = match[1]!;
    if (spec.startsWith('@/')) {
      items.add(basename(spec));
    } else if (!spec.startsWith('.') && !spec.startsWith('node:')) {
      const parts = spec.split('/');
      const name = spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!;
      if (name !== 'react' && name !== 'react-dom') packages.add(name);
    }
  }
  return { packages: [...packages].sort(), items: [...items].sort() };
}

function versioned(name: string): string {
  const version = pkg.devDependencies[name];
  if (!version)
    throw new Error(`"${name}" is imported by the registry but missing from devDependencies.`);
  return `${name}@^${version}`;
}

function describe(name: string) {
  const info = meta[name];
  if (!info)
    throw new Error(`Add a title and description for "${name}" in scripts/registry-meta.ts.`);
  return info;
}

export function buildItems(): RegistryItem[] {
  const items: RegistryItem[] = [];
  for (const { dir, type } of SOURCES) {
    const files = readdirSync(join(root, dir))
      .filter((file) => ['.ts', '.tsx'].includes(extname(file)))
      .sort();
    for (const file of files) {
      const name = basename(file, extname(file));
      const path = `${dir}/${file}`;
      const content = readFileSync(join(root, path), 'utf8');
      const { packages, items: deps } = analyzeImports(content);
      items.push({
        name,
        type,
        ...describe(name),
        ...(packages.length ? { dependencies: packages.map(versioned) } : {}),
        ...(deps.length ? { registryDependencies: deps } : {}),
        files: [{ path, type, content }],
      });
    }
  }
  items.push({
    name: 'theme',
    type: 'style',
    ...describe('theme'),
    files: [
      {
        path: 'registry/theme/theme.css',
        type: 'style',
        target: 'glidekit.css',
        content: readFileSync(join(root, 'registry/theme/theme.css'), 'utf8'),
      },
    ],
  });

  const names = new Set(items.map((item) => item.name));
  for (const item of items) {
    for (const dep of item.registryDependencies ?? []) {
      if (!names.has(dep)) throw new Error(`${item.name} imports unknown registry item "${dep}".`);
    }
  }
  return items;
}

function stringify(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function render(items: RegistryItem[]): Map<string, string> {
  const out = new Map<string, string>();
  const index = {
    name: 'glidekit',
    items: items.map(({ files, ...item }) => ({
      ...item,
      files: files.map(({ content: _content, ...file }) => file),
    })),
  };
  out.set('index.json', stringify(index));
  for (const item of items) out.set(`${item.name}.json`, stringify(item));
  return out;
}

/** Writes a fresh registry into `dir`, replacing whatever was there. */
export function writeRegistry(dir: string): number {
  const outputs = render(buildItems());
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [file, content] of outputs) writeFileSync(join(dir, file), content);
  return outputs.size - 1;
}

function main() {
  const flag = process.argv.indexOf('--out');
  const dir =
    flag > 0 && process.argv[flag + 1]
      ? resolve(process.argv[flag + 1]!)
      : join(root, 'dist/registry');
  const count = writeRegistry(dir);
  console.log(`Registry built: ${count} items in ${dir}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
