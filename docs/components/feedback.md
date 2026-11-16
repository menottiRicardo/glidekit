# Feedback

## Toast

Render the toaster once, then call it from anywhere:

```tsx
import { Toaster, toaster } from '@/components/ui/toast';

<Toaster />;

toaster.success({ title: 'Saved', description: 'Your changes are live.' });
toaster.error({ title: 'Payment failed' });
toaster.create({ type: 'info', title: 'Deleted', action: { label: 'Undo', onClick: undo } });
toaster.promise(upload(file), {
  loading: { title: 'Uploading…' },
  success: { title: 'Uploaded' },
  error: (error) => ({ title: 'Upload failed', description: String(error) }),
});
toaster.dismiss(); // all
```

Toasts stack and expand on hover, pause while hovered or focused, and draw their status icon. Change placement, gap or duration in `toaster`'s options in `toast.tsx`.

## Progress

```tsx
<Progress value={60} label="Uploading" showValue />
<Progress value={null} label="Waiting" />
```

The fill moves with a spring. `null` shows an indeterminate bar.

## Skeleton

```tsx
<Skeleton className="h-4 w-48" />
<Skeleton className="size-10 rounded-full" />
```

A shimmering placeholder, hidden from assistive technology and static with reduced motion.
