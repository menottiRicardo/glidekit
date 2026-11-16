'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { fieldBase, floatingSurface, menuItem } from '@/lib/recipes';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { normalizeProps, Portal, useMachine } from '@zag-js/react';
import * as select from '@zag-js/select';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useId, useMemo, type ReactNode } from 'react';

export interface SelectItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  items: SelectItem[];
  label?: ReactNode;
  placeholder?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  className?: string;
}

const list: Variants = {
  closed: { opacity: 0, scale: 0.96, transition: { duration: 0.1 } },
  open: { opacity: 1, scale: 1, transition: { ...transitions.snappy, staggerChildren: 0.02 } },
};
const option: Variants = {
  closed: { opacity: 0, x: -4 },
  open: { opacity: 1, x: 0, transition: transitions.snappy },
};
const reducedVariants: Variants = { closed: { opacity: 0 }, open: { opacity: 1 } };

const toArray = (value: string | null | undefined) =>
  value === undefined ? undefined : value === null ? [] : [value];

export function Select({
  items,
  label,
  placeholder = 'Select…',
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: SelectProps) {
  const collection = useMemo(() => select.collection({ items }), [items]);
  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    value: toArray(value),
    defaultValue: toArray(defaultValue),
    onValueChange: (details) => onValueChange?.(details.value[0] ?? null),
    positioning: { sameWidth: true, gutter: 6 },
    ...props,
  });
  const api = select.connect(service, normalizeProps);
  const reduced = useReducedMotion();

  return (
    <div data-slot="select" {...api.getRootProps()} className={cn('grid w-full gap-2', className)}>
      {label && (
        <label {...api.getLabelProps()} className="text-sm font-medium">
          {label}
        </label>
      )}
      <div {...api.getControlProps()}>
        <button
          {...api.getTriggerProps()}
          className={cn(
            fieldBase,
            'flex h-9 items-center justify-between gap-2 text-left data-placeholder-shown:text-muted-foreground',
          )}
        >
          <span {...api.getValueTextProps()} className="truncate">
            {api.valueAsString || placeholder}
          </span>
          <motion.span
            {...forMotion(api.getIndicatorProps())}
            className="flex shrink-0 opacity-60"
            animate={{ rotate: api.open ? 180 : 0 }}
            transition={transitions.snappy}
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </motion.span>
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <AnimatePresence>
            {api.open && (
              <motion.div
                {...forMotion(api.getContentProps())}
                variants={reduced ? reducedVariants : list}
                initial="closed"
                animate="open"
                exit="closed"
                style={{ transformOrigin: 'var(--transform-origin)' }}
                className={cn(floatingSurface, 'max-h-72 overflow-y-auto p-1')}
              >
                {collection.items.map((item) => (
                  <motion.div
                    key={item.value}
                    {...forMotion(api.getItemProps({ item }))}
                    variants={reduced ? reducedVariants : option}
                    className={cn(menuItem, 'pr-8')}
                  >
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span
                      {...api.getItemIndicatorProps({ item })}
                      className="absolute right-2 flex items-center"
                    >
                      <CheckIcon />
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Portal>
      <select {...api.getHiddenSelectProps()}>
        <option value="" />
        {collection.items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
