# Display

## Card

```tsx
<Card interactive>
  <CardHeader>
    <CardTitle>Pro</CardTitle>
    <CardDescription>For teams</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter>…</CardFooter>
</Card>
```

`interactive` lifts the card slightly on hover.

## Badge

```tsx
<Badge variant="success">Active</Badge>
```

`variant`: `default`, `secondary`, `outline`, `success`, `warning`, `destructive`.

## Avatar

```tsx
<Avatar src={user.photo} name={user.name} size="lg" />
<AvatarGroup max={3}>{people.map((p) => <Avatar key={p.id} name={p.name} />)}</AvatarGroup>
```

Shows initials until the image loads (or if it fails), then fades the image in. `size`: `sm`,
`md`, `lg`. `AvatarGroup` overlaps avatars and collapses the rest into `+n`.

## Separator and Kbd

```tsx
<Separator orientation="vertical" />
<Kbd>⌘</Kbd><Kbd>K</Kbd>
```

Separators are decorative by default; pass `decorative={false}` for a semantic separator.
