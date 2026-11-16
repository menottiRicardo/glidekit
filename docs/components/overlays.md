# Overlays

All overlays trap or manage focus, close on Escape and outside click, and return focus to the
trigger. Triggers accept `asChild` to merge their behavior into your own element.

## Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Edit</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Saved when you press Save.</DialogDescription>
    </DialogHeader>
    …
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="ghost">Cancel</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Control it with `open` / `onOpenChange`. Use `role="alertdialog"` for confirmations (focus goes to
the close button and outside clicks don't close it). `showClose={false}` hides the × button.
Nested dialogs close one layer at a time.

## Drawer

```tsx
<Drawer>
  <DrawerTrigger>Filters</DrawerTrigger>
  <DrawerContent side="right">
    <DrawerHeader>
      <DrawerTitle>Filters</DrawerTitle>
    </DrawerHeader>
    …
  </DrawerContent>
</Drawer>
```

`side`: `bottom` (default), `top`, `left`, `right`. Users can drag the panel toward its edge to
close it (past 100px or with a quick flick). `draggable={false}` turns that off. Built on Dialog,
so it takes the same props.

## Popover

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Details</Button>
  </PopoverTrigger>
  <PopoverContent>
    <PopoverTitle>Shipping</PopoverTitle>
    <PopoverDescription>…</PopoverDescription>
  </PopoverContent>
</Popover>
```

Placement via `positioning={{ placement: 'top-start' }}`. Scales in from the side it opens on.

## Tooltip

```tsx
<Tooltip content="Copy" side="bottom">
  <Button size="icon" aria-label="Copy">
    …
  </Button>
</Tooltip>
```

Opens on hover and focus after `openDelay` (400ms). The child must accept a ref and props.

## Dropdown Menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Project</DropdownMenuLabel>
    <DropdownMenuItem value="rename" shortcut="⌘R" onSelect={rename}>
      Rename
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem value="delete" variant="destructive" onSelect={remove}>
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Items stagger in. Arrow keys, typeahead, Enter and Escape work. Each item needs a unique
`value`.
