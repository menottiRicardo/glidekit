'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { normalizeProps, useMachine } from '@zag-js/react';
import * as slider from '@zag-js/slider';
import { AnimatePresence, motion } from 'motion/react';
import { useId, useState, type ReactNode } from 'react';

export interface SliderProps extends Omit<slider.Props, 'id' | 'ids' | 'dir' | 'getRootNode'> {
  label?: ReactNode;
  /** Show the current value next to the label. */
  showValue?: boolean;
  /** Show a bubble with the value above the thumb while dragging or focused. */
  bubble?: boolean;
  /** One accessible name per thumb (needed for range sliders). */
  thumbLabels?: string[];
  className?: string;
}

export function Slider({
  label,
  showValue = false,
  bubble = true,
  thumbLabels,
  className,
  ...props
}: SliderProps) {
  const service = useMachine(slider.machine, {
    id: useId(),
    defaultValue: props.value ? undefined : [props.min ?? 0],
    thumbAlignment: 'center',
    ...props,
  });
  const api = slider.connect(service, normalizeProps);
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState<number | null>(null);

  return (
    <div data-slot="slider" {...api.getRootProps()} className={cn('grid w-full gap-3', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <label {...api.getLabelProps()} className="font-medium">
              {label}
            </label>
          )}
          {showValue && (
            <output {...api.getValueTextProps()} className="text-muted-foreground tabular-nums">
              {api.value.join(' – ')}
            </output>
          )}
        </div>
      )}
      <div {...api.getControlProps()} className="relative flex h-5 items-center">
        <div
          {...api.getTrackProps()}
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted"
        >
          <div {...api.getRangeProps()} className="absolute h-full bg-primary" />
        </div>
        {api.value.map((value, index) => {
          const thumb = api.getThumbProps({ index, name: thumbLabels?.[index] });
          const active = api.dragging || focused === index;
          return (
            // The machine positions the thumb with a CSS transform, so motion
            // animates an inner element instead of the thumb itself.
            <div
              key={index}
              {...thumb}
              aria-label={thumbLabels?.[index] ?? (typeof label === 'string' ? label : undefined)}
              onFocus={(event) => {
                thumb.onFocus?.(event);
                setFocused(index);
              }}
              onBlur={(event) => {
                thumb.onBlur?.(event);
                setFocused(null);
              }}
              className="group/thumb block size-4.5 rounded-full outline-none data-disabled:pointer-events-none"
            >
              <motion.span
                aria-hidden
                animate={{ scale: api.dragging && !reduced ? 1.15 : 1 }}
                transition={transitions.snappy}
                className={cn(
                  'block size-full rounded-full border-2 border-primary bg-background shadow-sm',
                  'group-data-focus/thumb:ring-[4px] group-data-focus/thumb:ring-ring/30',
                )}
              />
              <AnimatePresence>
                {bubble && active && (
                  <motion.span
                    aria-hidden
                    initial={{ opacity: 0, y: 4, scale: reduced ? 1 : 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: reduced ? 1 : 0.8 }}
                    transition={transitions.snappy}
                    className="absolute bottom-full left-1/2 mb-2 -ml-5 w-10 rounded-md bg-foreground py-0.5 text-center text-xs font-medium text-background tabular-nums"
                  >
                    {value}
                  </motion.span>
                )}
              </AnimatePresence>
              <input {...api.getHiddenInputProps({ index })} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
