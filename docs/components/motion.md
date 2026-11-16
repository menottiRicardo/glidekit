# Motion

## Animated Number

```tsx
<AnimatedNumber value={revenue} format={{ style: 'currency', currency: 'USD' }} />
```

Counts to the new value whenever it changes. `format` and `locale` use `Intl.NumberFormat`.
`startOnView` waits until it scrolls into view. Screen readers get the final value only.

## Text Reveal

```tsx
<TextReveal as="h1" text="Components that move with intent." />
<TextReveal by="letter" text="Letter by letter" stagger={0.03} />
```

Words (or letters) blur and rise into place when the text enters the viewport. `repeat` replays it
each time. Screen readers read the full text once; with reduced motion it renders as plain text.
