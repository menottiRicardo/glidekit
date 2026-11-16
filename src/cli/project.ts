import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type PackageManager = 'pnpm' | 'yarn' | 'bun' | 'npm';

export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(cwd, 'bun.lock')) || existsSync(join(cwd, 'bun.lockb'))) return 'bun';
  const agent = process.env.npm_config_user_agent ?? '';
  if (agent.startsWith('pnpm')) return 'pnpm';
  if (agent.startsWith('yarn')) return 'yarn';
  if (agent.startsWith('bun')) return 'bun';
  return 'npm';
}

export function readPackageJson(cwd: string): Record<string, unknown> | null {
  const file = join(cwd, 'package.json');
  return existsSync(file)
    ? (JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>)
    : null;
}

/** Packages from `deps` (name@range) that package.json does not list yet. */
export function missingDependencies(cwd: string, deps: string[]): string[] {
  const pkg = readPackageJson(cwd) ?? {};
  const installed = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };
  return deps.filter((dep) => {
    const at = dep.lastIndexOf('@');
    return !((at > 0 ? dep.slice(0, at) : dep) in installed);
  });
}

export function installCommand(pm: PackageManager, deps: string[]): [string, string[]] {
  return [pm, [pm === 'npm' ? 'install' : 'add', ...deps]];
}

export function install(cwd: string, deps: string[]): boolean {
  if (deps.length === 0) return true;
  const [cmd, args] = installCommand(detectPackageManager(cwd), deps);
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status === 0;
}
