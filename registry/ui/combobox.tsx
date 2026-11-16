'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { fieldBase, floatingSurface, menuItem } from '@/lib/recipes';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import * as combobox from '@zag-js/combobox';
import { normalizeProps, Portal, useMachine } from '@zag-js/react';
import { AnimatePresence, motion } from 'motion/react';
import { useId, useMemo, useState, type ReactNode } from 'react';

export interface ComboboxItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  items: ComboboxItem[];
  label?: ReactNode;
  placeholder?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Shown when nothing matches the typed text. */
  emptyText?: ReactNode;
  /** Custom matching; defaults to a case-insensitive "contains" on the label. */
  filter?: (item: ComboboxItem, query: string) => boolean;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

export function defaultFilter(item: ComboboxItem, query: string): boolean {
  return item.label.toLowerCase().includes(query.trim().toLowerCase());
}

const toArray = (value: string | null | undefined) =>
  value === undefined ? undefined : value === null ? [] : [value];

export function Combobox({
  items,
  label,
  placeholder = 'Search…',
  value,
  defaultValue,
  onValueChange,
  emptyText = 'No results',
  filter = defaultFilter,
  className,
  ...props
}: ComboboxProps) {
  const [query, setQuery] = useState('');
  const matches = useMemo(
    () => (query ? items.filter((item) => filter(item, query)) : items),
    [items, query, filter],
  );
  const collection = useMemo(() => combobox.collection({ items: matches }), [matches]);

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    value: toArray(value),
    defaultValue: toArray(defaultValue),
    placeholder,
    openOnClick: true,
    positioning: { sameWidth: true, gutter: 6 },
    onInputValueChange: ({ inputValue, reason }) => {
      setQuery(reason === 'input-change' ? inputValue : '');
    },
    onValueChange: (details) => onValueChange?.(details.value[0] ?? null),
    ...props,
  });
  const api = combobox.connect(service, normalizeProps);
  const reduced = useReducedMotion();

  return (
    <div
      data-slot="combobox"
      {...api.getRootProps()}
      className={cn('grid w-full gap-2', className)}
    >
      {label && (
        <label {...api.getLabelProps()} className="text-sm font-medium">
          {label}
        </label>
      )}
      <div {...api.getControlProps()} className="relative">
        <input {...api.getInputProps()} className={cn(fieldBase, 'h-9 pr-9')} />
        <button
          {...api.getTriggerProps()}
          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground"
        >
          <motion.svg
            viewBox="0 0 16 16"
            className="size-4"
            aria-hidden
            animate={{ rotate: api.open ? 180 : 0 }}
            transition={transitions.snappy}
          >
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </motion.svg>
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <AnimatePresence>
            {api.open && (
              <motion.div
                {...forMotion(api.getContentProps())}
                initial={{ opacity: 0, y: reduced ? 0 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={transitions.snappy}
                className={cn(floatingSurface, 'max-h-72 overflow-y-auto p-1')}
              >
                {collection.items.length === 0 && (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    {emptyText}
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {collection.items.map((item) => (
                    <motion.div
                      key={item.value}
                      layout={reduced ? false : 'position'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      {...forMotion(api.getItemProps({ item }))}
                      className={cn(menuItem, 'pr-8')}
                    >
                      <span {...api.getItemTextProps({ item })}>{item.label}</span>
                      <span
                        {...api.getItemIndicatorProps({ item })}
                        className="absolute right-2 flex items-center"
                      >
                        <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
                          <path
                            d="M3.5 8.5l3 3 6-7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Portal>
    </div>
  );
}
