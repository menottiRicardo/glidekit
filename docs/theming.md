# Theming

`glidekit.css` defines every color as a CSS variable on `:root` and `.dark`, then maps them to
Tailwind colors with `@theme inline`. Components only use those tokens (`bg-primary`,
`text-muted-foreground`, `border-input`, …).

## Change colors

Override variables after the import:

```css
@import 'tailwindcss';
@import './glidekit.css';

:root {
  --primary: oklch(0.6 0.2 150);
  --radius: 0.5rem;
}

.dark {
  --primary: oklch(0.72 0.17 150);
}
```

| Token                               | Used for                                            |
| ----------------------------------- | --------------------------------------------------- |
| `background/foreground`             | Page and default text                               |
| `card`, `popover`                   | Surfaces and floating panels                        |
| `primary`                           | Primary buttons, checked controls, focus            |
| `secondary`, `muted`, `accent`      | Subtle fills, hovers, highlighted items             |
| `destructive`, `success`, `warning` | Status colors                                       |
| `border`, `input`, `ring`           | Borders, field borders, focus rings                 |
| `radius`                            | Base corner radius (`rounded-sm…xl` derive from it) |

## Dark mode

Add the `dark` class to `<html>`. The `dark:` variant is wired to that class, so it works with any
theme switcher.

## Change a component

The component is your code. Variant classes live in `lib/recipes.ts` (buttons, badges, inputs,
menu items, toasts); everything else is inline in the component file.
