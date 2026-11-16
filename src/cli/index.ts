import { Command } from 'commander';
import pkg from '../../package.json' with { type: 'json' };
import { add } from './commands/add';
import { diff } from './commands/diff';
import { init } from './commands/init';
import { list } from './commands/list';
import { consoleLogger } from './logger';

const program = new Command()
  .name('glidekit')
  .description('Add animated, accessible components to your app.')
  .version(pkg.version);

program
  .command('init')
  .description('Set up glidekit: config, theme tokens and the cn helper.')
  .option('--css <path>', 'stylesheet that imports Tailwind')
  .option('--registry <url>', 'registry URL or local folder')
  .option('-f, --force', 'replace an existing glidekit.json and theme')
  .option('--no-install', 'skip installing dependencies')
  .action(async (opts) => {
    await init({ cwd: process.cwd(), ...opts });
  });

program
  .command('add')
  .description('Copy components (and what they depend on) into your project.')
  .argument('<components...>', 'component names, e.g. button dialog')
  .option('-o, --overwrite', 'overwrite existing files')
  .option('-y, --yes', 'skip prompts')
  .option('-p, --path <dir>', 'folder for the components')
  .option('--dry-run', 'show what would change without writing')
  .option('--no-install', 'skip installing dependencies')
  .action(async (components: string[], opts) => {
    await add(components, { cwd: process.cwd(), ...opts });
  });

program
  .command('list')
  .description('Show the available components.')
  .option('--registry <url>', 'registry URL or local folder')
  .action(async (opts) => {
    await list({ cwd: process.cwd(), ...opts });
  });

program
  .command('diff')
  .description('Compare a local component with the registry version.')
  .argument('<component>', 'component name')
  .action(async (component: string) => {
    const results = await diff(component, { cwd: process.cwd() });
    if (results.some((r) => r.missing || r.changes.length)) process.exitCode = 1;
  });

program.parseAsync().catch((error: unknown) => {
  consoleLogger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
