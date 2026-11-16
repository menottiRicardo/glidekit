import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { readConfig, registryFor, type Config } from '../config';
import { confirm as askUser, consoleLogger, type Logger } from '../logger';
import { install, missingDependencies } from '../project';
import {
  collectDependencies,
  resolveTree,
  type RegistryFile,
  type RegistryItem,
} from '../registry';
import { rewriteImports } from '../transform';

export interface AddOptions {
  cwd: string;
  /** Overwrite existing files without asking. */
  overwrite?: boolean;
  /** Skip every prompt (existing files are kept unless --overwrite). */
  yes?: boolean;
  /** Print what would happen without writing or installing. */
  dryRun?: boolean;
  /** Install npm dependencies (default true). */
  install?: boolean;
  /** Write ui components into this folder instead of the configured one. */
  path?: string;
  logger?: Logger;
  confirm?: (question: string) => Promise<boolean>;
}

export interface AddResult {
  written: string[];
  skipped: string[];
  dependencies: string[];
}

/** Where a registry file lands in the user's project. */
export function targetPath(config: Config, file: RegistryFile, override?: string): string {
  const name = file.path.split('/').pop()!;
  switch (file.type) {
    case 'ui':
      return join(override ?? config.paths.ui, name);
    case 'lib':
      return join(config.paths.lib, name);
    case 'hook':
      return join(config.paths.hooks, name);
    case 'style':
      return join(dirname(config.css), file.target ?? name);
  }
}

export async function writeItems(
  items: RegistryItem[],
  config: Config,
  options: AddOptions,
): Promise<Pick<AddResult, 'written' | 'skipped'>> {
  const logger = options.logger ?? consoleLogger;
  const ask = options.confirm ?? askUser;
  const written: string[] = [];
  const skipped: string[] = [];

  for (const item of items) {
    for (const file of item.files) {
      const rel = targetPath(config, file, item.type === 'ui' ? options.path : undefined);
      const abs = join(options.cwd, rel);
      const content = rewriteImports(file.content ?? '', config.aliases);

      if (existsSync(abs)) {
        if (readFileSync(abs, 'utf8') === content) {
          skipped.push(rel);
          continue;
        }
        const replace =
          options.overwrite || (!options.yes && (await ask(`${rel} already exists. Overwrite?`)));
        if (!replace) {
          logger.warn(`Kept existing ${rel}`);
          skipped.push(rel);
          continue;
        }
      }

      if (!options.dryRun) {
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, content);
      }
      written.push(rel);
    }
  }
  return { written, skipped };
}

export async function add(names: string[], options: AddOptions): Promise<AddResult> {
  const logger = options.logger ?? consoleLogger;
  const config = readConfig(options.cwd);
  if (!config) throw new Error('No glidekit.json found. Run `glidekit init` first.');
  if (names.length === 0)
    throw new Error('Name at least one component, e.g. `glidekit add button`.');

  const items = await resolveTree(registryFor(config), names, options.cwd);
  const { written, skipped } = await writeItems(items, config, options);
  const dependencies = missingDependencies(options.cwd, collectDependencies(items));

  const verb = options.dryRun ? 'Would write' : 'Wrote';
  for (const file of written) logger.success(`${verb} ${relative('.', file)}`);
  if (dependencies.length) {
    if (options.dryRun || options.install === false) {
      logger.info(`Dependencies to install: ${dependencies.join(' ')}`);
    } else if (!install(options.cwd, dependencies)) {
      throw new Error(
        `Installing dependencies failed. Install them manually: ${dependencies.join(' ')}`,
      );
    }
  }
  if (written.length === 0) logger.info('Everything is already up to date.');
  return { written, skipped, dependencies };
}
