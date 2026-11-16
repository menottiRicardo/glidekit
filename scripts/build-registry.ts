/**
 * Builds the component registry from the source in registry/.
 *
 *   registry.json      index in the shadcn registry schema
 *   public/r/<name>.json  one item per component, with file contents inlined
 *
 * npm dependencies and registry dependencies are read from each file's imports,
 * so they can never drift from the code. `--check` fails if the output is stale.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { meta } from './registry-meta';

export const REGISTRY_URL =
  'https://raw.githubusercontent.com/menottiRicardo/glidekit/main/public/r';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  devDependencies: Record<string, string>;
};

type ItemType = 'registry:ui' | 'registry:lib' | 'registry:hook' | 'registry:style';

interface RegistryFile {
  path: string;
  type: ItemType;
  target?: string;
  content?: string;
}

export interface RegistryItem {
  $schema?: string;
  name: string;
  type: ItemType;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}

const SOURCES: { dir: string; type: ItemType }[] = [
  { dir: 'registry/lib', type: 'registry:lib' },
  { dir: 'registry/hooks', type: 'registry:hook' },
  { dir: 'registry/ui', type: 'registry:ui' },
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
    type: 'registry:style',
    ...describe('theme'),
    files: [
      {
        path: 'registry/theme/theme.css',
        type: 'registry:style',
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
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'glidekit',
    homepage: 'https://github.com/menottiRicardo/glidekit',
    items: items.map(({ files, ...item }) => ({
      ...item,
      files: files.map(({ content: _content, ...file }) => file),
    })),
  };
  out.set('registry.json', stringify(index));
  out.set('public/r/index.json', stringify(index));
  for (const item of items) {
    out.set(
      `public/r/${item.name}.json`,
      stringify({
        $schema: 'https://ui.shadcn.com/schema/registry-item.json',
        ...item,
        // Full URLs so `npx shadcn add <url>` can resolve dependencies too.
        ...(item.registryDependencies
          ? {
              registryDependencies: item.registryDependencies.map(
                (dep) => `${REGISTRY_URL}/${dep}.json`,
              ),
            }
          : {}),
      }),
    );
  }
  return out;
}

function main() {
  const check = process.argv.includes('--check');
  const outputs = render(buildItems());
  const stale: string[] = [];
  for (const [file, content] of outputs) {
    const path = join(root, file);
    const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (current === content) continue;
    if (check) stale.push(file);
    else {
      mkdirSync(join(path, '..'), { recursive: true });
      writeFileSync(path, content);
    }
  }
  if (check && stale.length) {
    console.error(`Registry is out of date. Run \`pnpm registry:build\`.\n  ${stale.join('\n  ')}`);
    process.exit(1);
  }
  console.log(check ? 'Registry is up to date.' : `Registry built: ${outputs.size - 2} items.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
