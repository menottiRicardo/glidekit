import { readFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

export type ItemType = 'registry:ui' | 'registry:lib' | 'registry:hook' | 'registry:style';

export interface RegistryFile {
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

export interface RegistryIndex {
  name: string;
  items: Omit<RegistryItem, 'files'>[];
}

const isUrl = (value: string) => /^https?:\/\//.test(value);

/** "dialog", "dialog.json" or a full item URL → "dialog". */
export function itemName(ref: string): string {
  const last = ref.split('/').pop() ?? ref;
  return last.replace(/\.json$/, '');
}

async function load<T>(registry: string, file: string, cwd: string): Promise<T> {
  if (isUrl(registry)) {
    const url = `${registry.replace(/\/$/, '')}/${file}`;
    const response = await fetch(url);
    if (response.status === 404)
      throw new Error(`Not found in the registry: ${file.replace(/\.json$/, '')}`);
    if (!response.ok) throw new Error(`Registry request failed (${response.status}): ${url}`);
    return (await response.json()) as T;
  }
  const dir = isAbsolute(registry) ? registry : resolve(cwd, registry);
  try {
    return JSON.parse(await readFile(join(dir, file), 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Not found in the registry: ${file.replace(/\.json$/, '')}`, {
        cause: error,
      });
    }
    throw error;
  }
}

export function fetchItem(registry: string, name: string, cwd: string): Promise<RegistryItem> {
  return load<RegistryItem>(registry, `${itemName(name)}.json`, cwd);
}

export function fetchIndex(registry: string, cwd: string): Promise<RegistryIndex> {
  return load<RegistryIndex>(registry, 'index.json', cwd);
}

/** Fetches the requested items plus everything they depend on, dependencies first. */
export async function resolveTree(
  registry: string,
  names: string[],
  cwd: string,
): Promise<RegistryItem[]> {
  const seen = new Map<string, RegistryItem>();
  const order: RegistryItem[] = [];

  async function visit(ref: string, trail: string[]) {
    const name = itemName(ref);
    if (seen.has(name) || trail.includes(name)) return;
    const item = await fetchItem(registry, name, cwd);
    seen.set(name, item);
    for (const dep of item.registryDependencies ?? []) await visit(dep, [...trail, name]);
    order.push(item);
  }

  for (const name of names) await visit(name, []);
  return order;
}

/** Merges npm dependencies, keeping one entry per package. */
export function collectDependencies(items: RegistryItem[]): string[] {
  const byName = new Map<string, string>();
  for (const dep of items.flatMap((item) => item.dependencies ?? [])) {
    const at = dep.lastIndexOf('@');
    const name = at > 0 ? dep.slice(0, at) : dep;
    byName.set(name, dep);
  }
  return [...byName.values()].sort();
}
