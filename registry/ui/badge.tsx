import { cn } from '@/lib/cn';
import { badgeVariants, type BadgeVariants } from '@/lib/recipes';
import type { ComponentProps } from 'react';

export interface BadgeProps extends ComponentProps<'span'>, BadgeVariants {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
