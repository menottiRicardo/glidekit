import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  defaultConfig,
  detectCss,
  readConfig,
  registryFor,
  writeConfig,
  type Config,
} from '../config';
import { consoleLogger, type Logger } from '../logger';
import { install, missingDependencies, readPackageJson } from '../project';
import { collectDependencies, resolveTree } from '../registry';
import { injectCssImport } from '../transform';
import { writeItems, type AddOptions } from './add';

export interface InitOptions extends Pick<
  AddOptions,
  'cwd' | 'install' | 'logger' | 'confirm' | 'yes'
> {
  /** Path to the stylesheet that imports Tailwind. Detected when omitted. */
  css?: string;
  registry?: string;
  /** Replace an existing glidekit.json. */
  force?: boolean;
}

export async function init(options: InitOptions): Promise<Config> {
  const logger: Logger = options.logger ?? consoleLogger;
  const { cwd } = options;

  const pkg = readPackageJson(cwd);
  if (!pkg) throw new Error('No package.json found. Run this from the root of your app.');
  const deps = { ...(pkg.dependencies as object), ...(pkg.devDependencies as object) };
  if (!('react' in deps)) logger.warn('React was not found in package.json.');
  if (!('tailwindcss' in deps))
    logger.warn('Tailwind CSS was not found. glidekit needs Tailwind v4.');

  const existing = readConfig(cwd);
  if (existing && !options.force) {
    logger.info('glidekit.json already exists; keeping it (use --force to replace).');
  }

  const css = options.css ?? existing?.css ?? detectCss(cwd);
  if (!css) {
    throw new Error(
      'Could not find the CSS file that imports Tailwind. Pass it with --css <path>.',
    );
  }
  if (!existsSync(join(cwd, css))) throw new Error(`CSS file not found: ${css}`);

  const config = existing && !options.force ? existing : defaultConfig(cwd, css, options.registry);
  writeConfig(cwd, config);
  logger.success('Wrote glidekit.json');

  const items = await resolveTree(registryFor(config), ['theme', 'cn'], cwd);
  const { written } = await writeItems(items, config, { ...options, overwrite: options.force });
  for (const file of written) logger.success(`Wrote ${file}`);

  const cssPath = join(cwd, config.css);
  const before = readFileSync(cssPath, 'utf8');
  const after = injectCssImport(before);
  if (after !== before) {
    writeFileSync(cssPath, after);
    logger.success(`Imported glidekit.css in ${config.css}`);
  }

  const missing = missingDependencies(cwd, collectDependencies(items));
  if (missing.length) {
    if (options.install === false) logger.info(`Dependencies to install: ${missing.join(' ')}`);
    else if (!install(cwd, missing)) {
      throw new Error(
        `Installing dependencies failed. Install them manually: ${missing.join(' ')}`,
      );
    }
  }

  logger.info('\nReady. Add components with `glidekit add button dialog`.');
  return config;
}
