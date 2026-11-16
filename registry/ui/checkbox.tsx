'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import * as checkbox from '@zag-js/checkbox';
import { normalizeProps, useMachine } from '@zag-js/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

export interface CheckboxProps extends Omit<checkbox.Props, 'id' | 'ids' | 'dir' | 'getRootNode'> {
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function Checkbox({ label, description, className, ...props }: CheckboxProps) {
  const service = useMachine(checkbox.machine, { id: useId(), ...props });
  const api = checkbox.connect(service, normalizeProps);
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the native input's mixed state in sync so assistive tech announces it.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = api.indeterminate;
  }, [api.indeterminate]);

  const draw = reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' as const };

  return (
    <label
      data-slot="checkbox"
      {...api.getRootProps()}
      className={cn(
        'group inline-flex items-start gap-2.5 text-sm data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
    >
      <motion.div
        {...forMotion(api.getControlProps())}
        whileTap={reduced ? undefined : { scale: 0.88 }}
        transition={transitions.snappy}
        className={cn(
          'mt-px flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border border-input shadow-xs',
          'transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
          'text-primary-foreground data-invalid:border-destructive',
          'data-focus-visible:ring-[3px] data-focus-visible:ring-ring/40',
        )}
      >
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
          <AnimatePresence initial={false}>
            {api.checkedState === true && (
              <motion.path
                key="check"
                d="M3.5 8.5l3 3 6-7"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ pathLength: 0, transition: { duration: 0.1 } }}
                transition={draw}
              />
            )}
            {api.checkedState === 'indeterminate' && (
              <motion.path
                key="dash"
                d="M4 8h8"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ pathLength: 0, transition: { duration: 0.1 } }}
                transition={draw}
              />
            )}
          </AnimatePresence>
        </svg>
      </motion.div>
      {(label || description) && (
        <span className="grid gap-1 leading-none">
          {label && (
            <span {...api.getLabelProps()} className="font-medium">
              {label}
            </span>
          )}
          {description && <span className="text-muted-foreground">{description}</span>}
        </span>
      )}
      <input ref={inputRef} {...api.getHiddenInputProps()} />
    </label>
  );
}
