# CLI

```bash
npx glidekit <command>
```

## init

Sets up a project. Run it once from the folder that has your `package.json`.

1. Finds the stylesheet that imports Tailwind (`src/index.css`, `app/globals.css`, …).
2. Writes `glidekit.css` (theme tokens) next to it and adds `@import "./glidekit.css";` right
   after the Tailwind import.
3. Adds `lib/cn.ts` and installs `clsx` and `tailwind-merge`.
4. Saves `glidekit.json`.

| Option             | Description                                         |
| ------------------ | --------------------------------------------------- |
| `--css <path>`     | Stylesheet to use when it can't be detected.        |
| `--registry <url>` | Registry URL or a local folder of item JSON files.  |
| `-f, --force`      | Replace an existing `glidekit.json` and theme file. |
| `--no-install`     | Print the dependencies instead of installing them.  |

Running `init` again is safe: existing config is kept and the CSS import is never duplicated.

## add

```bash
npx glidekit add dialog tabs
```

Copies the components plus everything they import from the registry (helpers in `lib/`, hooks,
and other components, such as `slot` for `asChild`). Imports are rewritten to your aliases.
Missing npm packages are installed with the package manager your lockfile points to (pnpm, yarn,
bun or npm).

When a file already exists and differs, you're asked before it is replaced.

| Option             | Description                                        |
| ------------------ | -------------------------------------------------- |
| `-o, --overwrite`  | Replace existing files without asking.             |
| `-y, --yes`        | Never prompt; existing files are kept.             |
| `-p, --path <dir>` | Put components in another folder.                  |
| `--dry-run`        | Show what would be written and installed.          |
| `--no-install`     | Print the dependencies instead of installing them. |

## list

Shows every component with a one-line description.

## diff

```bash
npx glidekit diff tabs
```

Compares your copy with the registry version. Lines starting with `-` exist only in your file,
`+` only in the registry. Exits with code 1 when they differ, so it can run in CI.

## glidekit.json

```json
{
  "registry": "https://raw.githubusercontent.com/menottiRicardo/glidekit/main/public/r",
  "css": "src/index.css",
  "aliases": { "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" },
  "paths": { "ui": "src/components/ui", "lib": "src/lib", "hooks": "src/hooks" }
}
```

- `aliases` are written into imports; `paths` are where files go. Both are derived from the
  `@/*`-style alias in `tsconfig.json` or `tsconfig.app.json` (any prefix works, e.g. `~/*`).
- `registry` can point to a fork or a local folder.
