'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import * as radio from '@zag-js/radio-group';
import { normalizeProps, useMachine } from '@zag-js/react';
import { motion } from 'motion/react';
import { createContext, useContext, useId, type ReactNode } from 'react';

type RadioApi = ReturnType<typeof radio.connect>;
const RadioContext = createContext<RadioApi | null>(null);

function useRadioGroup(): RadioApi {
  const api = useContext(RadioContext);
  if (!api) throw new Error('<RadioGroupItem> must be used inside <RadioGroup>.');
  return api;
}

export interface RadioGroupProps extends Omit<radio.Props, 'id' | 'ids' | 'dir' | 'getRootNode'> {
  label?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function RadioGroup({ label, className, children, ...props }: RadioGroupProps) {
  const service = useMachine(radio.machine, { id: useId(), ...props });
  const api = radio.connect(service, normalizeProps);

  return (
    <RadioContext.Provider value={api}>
      <div
        data-slot="radio-group"
        {...api.getRootProps()}
        className={cn(
          'flex gap-3 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
          className,
        )}
      >
        {label && (
          <span {...api.getLabelProps()} className="text-sm font-medium">
            {label}
          </span>
        )}
        {children}
      </div>
    </RadioContext.Provider>
  );
}

export interface RadioGroupItemProps {
  value: string;
  disabled?: boolean;
  invalid?: boolean;
  children?: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function RadioGroupItem({
  value,
  disabled,
  invalid,
  children,
  description,
  className,
}: RadioGroupItemProps) {
  const api = useRadioGroup();
  const reduced = useReducedMotion();
  const item = { value, disabled, invalid };
  const state = api.getItemState(item);

  return (
    <label
      {...api.getItemProps(item)}
      className={cn(
        'inline-flex items-start gap-2.5 text-sm data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
    >
      <motion.div
        {...forMotion(api.getItemControlProps(item))}
        whileTap={reduced ? undefined : { scale: 0.88 }}
        transition={transitions.snappy}
        className={cn(
          'mt-px flex size-4.5 shrink-0 items-center justify-center rounded-full border border-input shadow-xs',
          'transition-colors data-[state=checked]:border-primary data-invalid:border-destructive',
          'data-focus-visible:ring-[3px] data-focus-visible:ring-ring/40',
        )}
      >
        <motion.span
          className="size-2 rounded-full bg-primary"
          initial={false}
          animate={{ scale: state.checked ? 1 : 0, opacity: state.checked ? 1 : 0 }}
          transition={reduced ? transitions.fade : transitions.bouncy}
        />
      </motion.div>
      <span className="grid gap-1 leading-none">
        {children && (
          <span {...api.getItemTextProps(item)} className="font-medium">
            {children}
          </span>
        )}
        {description && <span className="text-muted-foreground">{description}</span>}
      </span>
      <input {...api.getItemHiddenInputProps(item)} />
    </label>
  );
}
