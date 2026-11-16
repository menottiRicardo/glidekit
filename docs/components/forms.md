# Forms

## Button

```tsx
<Button>Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button loading={saving}>Pay</Button>
```

`variant`: `primary` (default), `secondary`, `outline`, `ghost`, `destructive`, `link`.
`size`: `sm`, `md`, `lg`, `icon`. `loading` shows a spinner, disables the button and sets
`aria-busy`. Hover and press use a small spring scale (off for `link` and reduced motion).

## Input, Textarea, Label

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" aria-invalid={hasError} />
<Textarea placeholder="Grows with its content" />
```

`aria-invalid` turns the border red. `Textarea` grows with its content (`autoGrow`, default on).

## Checkbox

```tsx
<Checkbox label="Accept terms" description="Required" onCheckedChange={({ checked }) => …} />
<Checkbox label="Select all" checked="indeterminate" />
```

The check mark is drawn with a path animation. Supports `checked`, `defaultChecked`, `disabled`,
`invalid`, `required`, `name` and `value` for forms.

## Switch

```tsx
<Switch label="Notifications" defaultChecked onCheckedChange={({ checked }) => …} />
```

`size`: `sm`, `md`. The thumb moves with a spring layout animation. Exposed as `role="switch"`.

## Radio Group

```tsx
<RadioGroup label="Plan" defaultValue="pro" onValueChange={({ value }) => …}>
  <RadioGroupItem value="free">Free</RadioGroupItem>
  <RadioGroupItem value="pro" description="Best for teams">Pro</RadioGroupItem>
</RadioGroup>
```

Arrow keys move the selection. `orientation`: `vertical` (default) or `horizontal`.

## Slider

```tsx
<Slider label="Volume" defaultValue={[50]} showValue />
<Slider defaultValue={[100, 400]} min={0} max={500} step={10} thumbLabels={['Min', 'Max']} />
```

Pass two values for a range; give each thumb a name with `thumbLabels`. A value bubble appears
while dragging or focused (`bubble={false}` to hide it). Arrow keys, Page Up/Down, Home and End
work.

## Select

```tsx
<Select
  label="Framework"
  items={[{ label: 'Next.js', value: 'next' }, { label: 'Vite', value: 'vite' }]}
  onValueChange={(value) => …}
/>
```

Options stagger in. Typeahead, arrow keys and Enter work. `name` adds a hidden native `<select>`
so the value is submitted with forms. Items can be `disabled`.

## Combobox

```tsx
<Combobox label="Country" items={countries} emptyText="No country found" />
```

Filters as you type (case-insensitive "contains" by default; pass `filter` to change it).
Matching items animate in and out as the list changes.
