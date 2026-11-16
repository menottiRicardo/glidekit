# Animation

Components animate with [Motion](https://motion.dev). Shared values live in `lib/motion.ts`:

| Export            | Used by                                                  |
| ----------------- | -------------------------------------------------------- |
| `transitions`     | `snappy`, `smooth`, `bouncy` springs and a short `fade`  |
| `scaleIn`         | Dialog                                                   |
| `popIn`           | Popover, tooltip, menus (paired with `transform-origin`) |
| `slideFrom(side)` | Drawer                                                   |
| `collapse`        | Accordion                                                |
| `fade`            | Backdrops                                                |
| `press`           | Hover and tap feedback on buttons                        |

Change a spring there and every component that uses it follows.

## Reduced motion

`hooks/use-reduced-motion.ts` returns `true` when the OS asks for reduced motion, or when your app
sets `<MotionConfig reducedMotion="always">`. Components then drop movement (scale, slide,
blur, layout) and keep short opacity fades. `usePreset(preset)` does that conversion for the
presets above, using `reduce()` from `lib/motion.ts`.

Toast stacking uses CSS transitions and falls back to a fade under
`prefers-reduced-motion: reduce`.

## Exit animations

Overlays render their content only while open and use `AnimatePresence`, so closing plays the
exit animation before the element is removed. Focus returns to the trigger right away.
