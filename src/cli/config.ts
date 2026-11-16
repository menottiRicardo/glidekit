import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CONFIG_FILE = 'glidekit.json';

/**
 * The registry that ships inside the npm package (dist/registry, next to the
 * built CLI). Components are copied from here, so nothing is downloaded.
 */
export function bundledRegistry(): string {
  return fileURLToPath(new URL('./registry', import.meta.url));
}

/** An explicit folder wins, then glidekit.json, then the bundled registry. */
export function registryFor(config: Pick<Config, 'registry'> | null, override?: string): string {
  return override ?? config?.registry ?? bundledRegistry();
}

export interface Aliases {
  ui: string;
  lib: string;
  hooks: string;
}

export interface Config {
  /** Optional local folder of registry items; defaults to the one in the package. */
  registry?: string;
  /** The CSS file that imports Tailwind; glidekit.css is written next to it. */
  css: string;
  /** Import aliases written into component source. */
  aliases: Aliases;
  /** Folders (relative to the project root) the aliases point to. */
  paths: Aliases;
}

export function readConfig(cwd: string): Config | null {
  const file = join(cwd, CONFIG_FILE);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8')) as Config;
}

export function writeConfig(cwd: string, config: Config): void {
  writeFileSync(join(cwd, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`);
}

function readJson(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null;
  try {
    // tsconfig files may contain comments and trailing commas.
    const text = readFileSync(path, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Finds the folder the "@/*" alias points to (e.g. "src"), from tsconfig.json
 * or tsconfig.app.json. Falls back to "src" when it exists, else the root.
 */
export function detectAliasRoot(cwd: string): { prefix: string; dir: string } {
  for (const name of ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json']) {
    const json = readJson(join(cwd, name));
    const options = json?.compilerOptions as { paths?: Record<string, string[]> } | undefined;
    for (const [key, targets] of Object.entries(options?.paths ?? {})) {
      if (!key.endsWith('/*') || !targets[0]) continue;
      const prefix = key.slice(0, -2);
      const dir = targets[0].replace(/^\.\//, '').replace(/\/?\*$/, '') || '.';
      return { prefix, dir };
    }
  }
  return { prefix: '@', dir: existsSync(join(cwd, 'src')) ? 'src' : '.' };
}

export function defaultConfig(cwd: string, css: string, registry?: string): Config {
  const { prefix, dir } = detectAliasRoot(cwd);
  const path = (sub: string) => (dir === '.' ? sub : `${dir}/${sub}`);
  return {
    ...(registry ? { registry } : {}),
    css,
    aliases: { ui: `${prefix}/components/ui`, lib: `${prefix}/lib`, hooks: `${prefix}/hooks` },
    paths: { ui: path('components/ui'), lib: path('lib'), hooks: path('hooks') },
  };
}

const CSS_CANDIDATES = [
  'src/index.css',
  'src/app/globals.css',
  'app/globals.css',
  'src/styles/globals.css',
  'styles/globals.css',
  'src/global.css',
  'src/globals.css',
  'src/main.css',
  'src/styles.css',
  'src/App.css',
];

/** Finds the stylesheet that imports Tailwind v4. */
export function detectCss(cwd: string): string | null {
  const tailwind = /@import\s+['"]tailwindcss['"]/;
  for (const file of CSS_CANDIDATES) {
    const path = join(cwd, file);
    if (existsSync(path) && tailwind.test(readFileSync(path, 'utf8'))) return file;
  }
  return null;
}
