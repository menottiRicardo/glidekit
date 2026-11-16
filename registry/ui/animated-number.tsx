'use client';

import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';

export interface AnimatedNumberProps {
  value: number;
  /** Intl number format options, e.g. { style: 'currency', currency: 'USD' }. */
  format?: Intl.NumberFormatOptions;
  locale?: string;
  /** Seconds the count takes. */
  duration?: number;
  /** Wait until the number scrolls into view before counting. */
  startOnView?: boolean;
  className?: string;
}

/** Counts smoothly to `value` whenever it changes. */
export function AnimatedNumber({
  value,
  format,
  locale,
  duration = 0.8,
  startOnView = false,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, format]);
  const count = useMotionValue(startOnView ? 0 : value);
  const text = useTransform(count, (latest) => formatter.format(latest));

  useEffect(() => {
    if (startOnView && !inView) return;
    if (reduced) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [count, value, duration, reduced, startOnView, inView]);

  return (
    <span className={cn('tabular-nums', className)}>
      <motion.span ref={ref} aria-hidden>
        {text}
      </motion.span>
      <span className="sr-only">{formatter.format(value)}</span>
    </span>
  );
}
