'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { motion } from 'motion/react';
import type { ComponentProps } from 'react';

export interface CardProps extends ComponentProps<'div'> {
  /** Lift slightly on hover. Use for clickable cards. */
  interactive?: boolean;
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  const reduced = useReducedMotion();
  const hover = interactive && !reduced ? { y: -3, transition: transitions.snappy } : undefined;
  return (
    <motion.div
      data-slot="card"
      whileHover={hover}
      className={cn(
        'flex flex-col gap-5 rounded-xl border bg-card py-5 text-card-foreground shadow-sm',
        interactive && 'transition-shadow hover:shadow-md',
        className,
      )}
      {...forMotion(props)}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1.5 px-5', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3 data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-2 px-5', className)}
      {...props}
    />
  );
}
