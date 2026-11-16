import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pc from 'picocolors';
import { readConfig } from '../config';
import { consoleLogger, type Logger } from '../logger';
import { fetchItem } from '../registry';
import { diffLines, rewriteImports } from '../transform';
import { targetPath } from './add';

export interface DiffResult {
  file: string;
  changes: string[];
  missing: boolean;
}

/** Compares local copies of a component with the registry version. */
export async function diff(
  name: string,
  options: { cwd: string; logger?: Logger },
): Promise<DiffResult[]> {
  const logger = options.logger ?? consoleLogger;
  const config = readConfig(options.cwd);
  if (!config) throw new Error('No glidekit.json found. Run `glidekit init` first.');

  const item = await fetchItem(config.registry, name, options.cwd);
  const results: DiffResult[] = [];
  for (const file of item.files) {
    const rel = targetPath(config, file);
    const abs = join(options.cwd, rel);
    if (!existsSync(abs)) {
      logger.warn(`${rel} is not in your project. Add it with \`glidekit add ${item.name}\`.`);
      results.push({ file: rel, changes: [], missing: true });
      continue;
    }
    const remote = rewriteImports(file.content ?? '', config.aliases);
    const changes = diffLines(readFileSync(abs, 'utf8'), remote);
    results.push({ file: rel, changes, missing: false });
    if (changes.length === 0) {
      logger.success(`${rel} matches the registry.`);
    } else {
      logger.info(pc.bold(rel));
      for (const line of changes) logger.info(line.startsWith('+') ? pc.green(line) : pc.red(line));
    }
  }
  return results;
}
