import pc from 'picocolors';
import { readConfig, registryFor } from '../config';
import { consoleLogger, type Logger } from '../logger';
import { fetchIndex } from '../registry';

export async function list(options: { cwd: string; registry?: string; logger?: Logger }) {
  const logger = options.logger ?? consoleLogger;
  const registry = registryFor(readConfig(options.cwd), options.registry);
  const index = await fetchIndex(registry, options.cwd);
  const components = index.items.filter((item) => item.type === 'ui' && item.name !== 'slot');
  const width = Math.max(...components.map((item) => item.name.length));
  for (const item of components) {
    logger.info(`${pc.bold(item.name.padEnd(width))}  ${pc.dim(item.description)}`);
  }
  return components.map((item) => item.name);
}
