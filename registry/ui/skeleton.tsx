import { cn } from '@/lib/cn';
import type { ComponentProps } from 'react';

/** Loading placeholder with a shimmer sweep (static when motion is reduced). */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        'rounded-md bg-muted bg-[linear-gradient(90deg,transparent_25%,color-mix(in_oklab,var(--color-foreground)_8%,transparent)_50%,transparent_75%)]',
        'animate-shimmer bg-size-[200%_100%] motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
