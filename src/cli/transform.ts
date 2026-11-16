import type { Aliases } from './config';

const SOURCE: Aliases = { ui: '@/components/ui', lib: '@/lib', hooks: '@/hooks' };

/** Rewrites the registry's import aliases to the project's aliases. */
export function rewriteImports(content: string, aliases: Aliases): string {
  let out = content;
  for (const key of ['ui', 'lib', 'hooks'] as const) {
    if (aliases[key] === SOURCE[key]) continue;
    const from = SOURCE[key].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`(['"])${from}/`, 'g'), `$1${aliases[key]}/`);
  }
  return out;
}

/** Inserts `@import "./glidekit.css";` right after the Tailwind import. */
export function injectCssImport(css: string, importPath = './glidekit.css'): string {
  if (css.includes(importPath)) return css;
  const line = `@import "${importPath}";`;
  const tailwind = /^@import\s+['"]tailwindcss['"][^;\n]*;?[ \t]*$/m;
  const match = tailwind.exec(css);
  if (!match) return `${line}\n${css}`;
  const end = match.index + match[0].length;
  return `${css.slice(0, end)}\n${line}${css.slice(end)}`;
}

/** Minimal line diff: lines prefixed with "-" (local only) and "+" (registry only). */
export function diffLines(local: string, remote: string): string[] {
  const a = local.split('\n');
  const b = remote.split('\n');
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i]![j] =
        a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }
  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) out.push(`- ${a[i++]}`);
    else out.push(`+ ${b[j++]}`);
  }
  while (i < a.length) out.push(`- ${a[i++]}`);
  while (j < b.length) out.push(`+ ${b[j++]}`);
  return out;
}
