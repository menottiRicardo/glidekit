'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import * as progress from '@zag-js/progress';
import { normalizeProps, useMachine } from '@zag-js/react';
import { motion } from 'motion/react';
import { useId, type ReactNode } from 'react';

export interface ProgressProps {
  /** 0–max, or null for an indeterminate bar. */
  value: number | null;
  max?: number;
  label?: ReactNode;
  /** Show the formatted value next to the label. */
  showValue?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, label, showValue = false, className }: ProgressProps) {
  const service = useMachine(progress.machine, { id: useId(), value, max });
  const api = progress.connect(service, normalizeProps);
  const reduced = useReducedMotion();

  return (
    <div
      data-slot="progress"
      {...api.getRootProps()}
      className={cn('grid w-full gap-2', className)}
    >
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span {...api.getLabelProps()} className="font-medium">
              {label}
            </span>
          )}
          {showValue && (
            <span {...api.getValueTextProps()} className="text-muted-foreground tabular-nums">
              {api.valueAsString}
            </span>
          )}
        </div>
      )}
      <div
        {...api.getTrackProps()}
        className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        {api.indeterminate ? (
          <motion.div
            {...forMotion(api.getRangeProps())}
            style={undefined}
            className="absolute inset-y-0 w-1/3 rounded-full bg-primary"
            initial={{ left: '-33%' }}
            animate={reduced ? { left: '33%', opacity: [0.4, 1, 0.4] } : { left: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <motion.div
            {...forMotion(api.getRangeProps())}
            style={undefined}
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${api.percent}%` }}
            transition={reduced ? transitions.fade : transitions.smooth}
          />
        )}
      </div>
    </div>
  );
}
