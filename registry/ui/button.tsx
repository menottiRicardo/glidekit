'use client';

import { cn } from '@/lib/cn';
import { press } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { buttonVariants, type ButtonVariants } from '@/lib/recipes';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { AnimatePresence, motion } from 'motion/react';
import type { ComponentProps } from 'react';

export interface ButtonProps extends ComponentProps<'button'>, ButtonVariants {
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const reduced = useReducedMotion();
  const feedback = reduced || variant === 'link' ? {} : press;

  return (
    <motion.button
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...feedback}
      {...forMotion(props)}
    >
      <AnimatePresence initial={false}>
        {loading && (
          <motion.span
            key="spinner"
            aria-hidden
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="inline-flex"
          >
            <Spinner />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export { buttonVariants };
