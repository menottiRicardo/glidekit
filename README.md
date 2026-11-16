# glidekit

Animated, accessible React components built with **Tailwind CSS v4**, **Motion** and **Zag.js**.
The `glidekit` package contains every component and a small CLI that copies their source into
your app, so you own the code and can change anything.

- **Motion everywhere, done carefully.** Springs, shared-layout indicators, drawn checkmarks,
  drag-to-close drawers and staggered menus, all from one file of presets you can tune.
- **Accessible by default.** Behavior comes from Zag.js state machines: focus trapping and
  restoring, roving focus, typeahead, Escape and outside-click handling, and correct ARIA roles.
  Every component is checked with axe in the test suite.
- **Respects reduced motion.** With the OS setting or `<MotionConfig reducedMotion="always">`,
  movement is removed and only short fades remain.
- **Themeable with CSS variables.** Light and dark tokens in one stylesheet; restyle by
  overriding a few variables or editing the copied classes.
- **Only needs the npm registry.** Components ship inside the package and the CLI never goes
  online, so it works behind firewalls and mirrors that allow npm and nothing else.

## Quick start

Requirements: React 18 or newer, Tailwind CSS v4, and a TypeScript path alias such as `@/*`.

```bash
npm install --save-dev glidekit
npx glidekit init
```

Installing it as a dev dependency pins the version, so every teammate and CI run copies the
same components. Upgrading is `npm install --save-dev glidekit@latest`, then `glidekit diff`.

`init` finds the stylesheet that imports Tailwind, writes `glidekit.css` (theme tokens) next to
it, imports it, adds the `cn` helper and saves your settings to `glidekit.json`.

```bash
npx glidekit add button dialog tabs toast
```

`add` copies the components, everything they depend on (helpers, hooks, other components) and
installs their npm packages with your package manager. Those packages (Motion, Zag.js, clsx,
tailwind-merge, class-variance-authority) come from the npm registry like any other dependency.

```tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Hello</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
```

## Components

| Group      | Components                                                                              |
| ---------- | --------------------------------------------------------------------------------------- |
| Forms      | Button, Input, Textarea, Label, Checkbox, Switch, Radio Group, Slider, Select, Combobox |
| Overlays   | Dialog, Drawer, Popover, Tooltip, Dropdown Menu                                         |
| Navigation | Tabs, Accordion                                                                         |
| Feedback   | Toast, Progress, Skeleton                                                               |
| Display    | Card, Badge, Avatar, Separator, Kbd                                                     |
| Motion     | Animated Number, Text Reveal                                                            |

Run `npx glidekit list` to see them with descriptions. Usage for each is in
[docs/components](docs/components).

## CLI

| Command                   | What it does                                                  |
| ------------------------- | ------------------------------------------------------------- |
| `glidekit init`           | Config, theme tokens, CSS import and the `cn` helper.         |
| `glidekit add <names...>` | Copy components and their dependencies; install npm packages. |
| `glidekit list`           | List available components.                                    |
| `glidekit diff <name>`    | Show how your copy differs from the latest version.           |

Options and configuration: [docs/cli.md](docs/cli.md).

## Docs

- [Components](docs/components)
- [CLI and glidekit.json](docs/cli.md)
- [Theming](docs/theming.md)
- [Animation](docs/animation.md)

## Development

```bash
pnpm install
pnpm example        # playground with every component
pnpm test           # component, CLI and accessibility tests
pnpm build          # CLI plus the bundled registry in dist/
```

The component source lives in `registry/` (`ui/`, `lib/`, `hooks/`, `theme/`). `pnpm build`
turns it into `dist/registry`, which ships in the npm package next to the CLI.

## License

[MIT](LICENSE)
