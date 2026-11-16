'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { normalizeProps, useMachine } from '@zag-js/react';
import * as zagSwitch from '@zag-js/switch';
import { motion } from 'motion/react';
import { useId, type ReactNode } from 'react';

export interface SwitchProps extends Omit<
  zagSwitch.Props,
  'id' | 'ids' | 'dir' | 'getRootNode' | 'label'
> {
  label?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export function Switch({ label, size = 'md', className, ...props }: SwitchProps) {
  const service = useMachine(zagSwitch.machine, { id: useId(), ...props });
  const api = zagSwitch.connect(service, normalizeProps);
  const reduced = useReducedMotion();

  return (
    <label
      data-slot="switch"
      {...api.getRootProps()}
      className={cn(
        'inline-flex items-center gap-2.5 text-sm data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
    >
      <input {...api.getHiddenInputProps()} role="switch" />
      <span
        {...api.getControlProps()}
        className={cn(
          'flex shrink-0 items-center rounded-full p-0.5 transition-colors',
          'bg-input data-[state=checked]:bg-primary',
          'data-[state=checked]:justify-end data-[state=unchecked]:justify-start',
          'data-focus-visible:ring-[3px] data-focus-visible:ring-ring/40',
          size === 'sm' ? 'h-5 w-9' : 'h-6 w-11',
        )}
      >
        <motion.span
          {...forMotion(api.getThumbProps())}
          layout={!reduced}
          transition={transitions.bouncy}
          className={cn(
            'block rounded-full bg-background shadow-sm',
            size === 'sm' ? 'size-4' : 'size-5',
          )}
        />
      </span>
      {label && <span {...api.getLabelProps()}>{label}</span>}
    </label>
  );
}
