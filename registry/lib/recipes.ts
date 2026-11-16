import { cva, type VariantProps } from 'class-variance-authority';

/*
 * Class recipes for every component. Variants live here instead of inside the
 * components so they can be read, tested and restyled in one place.
 */

export const focusRing =
  'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-offset-0';

export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2',
    'whitespace-nowrap rounded-md text-sm font-medium transition-colors',
    'disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    focusRing,
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-success/15 text-success',
        warning: 'border-transparent bg-warning/20 text-warning-foreground dark:text-warning',
        destructive: 'border-transparent bg-destructive/15 text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;

export const fieldBase = [
  'w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs',
  'transition-[color,box-shadow,border-color] placeholder:text-muted-foreground',
  'focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30',
  focusRing,
].join(' ');

export const inputVariants = cva([fieldBase, 'h-9 py-1'], {
  variants: {
    size: { sm: 'h-8 text-xs', md: 'h-9', lg: 'h-10' },
  },
  defaultVariants: { size: 'md' },
});
export type InputVariants = VariantProps<typeof inputVariants>;

/** Surface used by every floating panel. */
export const floatingSurface =
  'z-50 rounded-lg border bg-popover text-popover-foreground shadow-lg outline-none';

export const menuItem = [
  'relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none',
  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
  '[&_svg]:size-4 [&_svg]:shrink-0',
].join(' ');

export const toastVariants = cva(
  'pointer-events-auto relative flex w-[356px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border p-4 pr-8 shadow-lg bg-popover text-popover-foreground',
  {
    variants: {
      type: {
        info: '[&_[data-icon]]:text-primary',
        success: '[&_[data-icon]]:text-success',
        warning: '[&_[data-icon]]:text-warning',
        error: '[&_[data-icon]]:text-destructive',
        loading: '[&_[data-icon]]:text-muted-foreground',
      },
    },
    defaultVariants: { type: 'info' },
  },
);

export const avatarVariants = cva(
  'relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted align-middle',
  {
    variants: {
      size: { sm: 'size-7 text-xs', md: 'size-9 text-sm', lg: 'size-12 text-base' },
    },
    defaultVariants: { size: 'md' },
  },
);
export type AvatarVariants = VariantProps<typeof avatarVariants>;
