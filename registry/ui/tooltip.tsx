'use client';

import { cn } from '@/lib/cn';
import { popIn } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { usePreset } from '@/hooks/use-preset';
import { Slot } from '@/components/ui/slot';
import { normalizeProps, Portal, useMachine } from '@zag-js/react';
import * as tooltip from '@zag-js/tooltip';
import { AnimatePresence, motion } from 'motion/react';
import { useId, type ReactElement, type ReactNode } from 'react';

export interface TooltipProps extends Omit<tooltip.Props, 'id' | 'ids' | 'dir' | 'getRootNode'> {
  /** What the tooltip says. */
  content: ReactNode;
  /** The element that triggers the tooltip. Must accept props and a ref. */
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
  positioning,
  openDelay = 400,
  closeDelay = 100,
  ...props
}: TooltipProps) {
  const service = useMachine(tooltip.machine, {
    id: useId(),
    openDelay,
    closeDelay,
    positioning: { placement: side, gutter: 6, ...positioning },
    ...props,
  });
  const api = tooltip.connect(service, normalizeProps);
  const preset = usePreset(popIn);

  return (
    <>
      <Slot {...api.getTriggerProps()}>{children}</Slot>
      <Portal>
        <div {...api.getPositionerProps()}>
          <AnimatePresence>
            {api.open && (
              <motion.div
                data-slot="tooltip-content"
                {...forMotion(api.getContentProps())}
                {...preset}
                style={{ transformOrigin: 'var(--transform-origin)' }}
                className={cn(
                  'z-50 max-w-xs rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md',
                  className,
                )}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Portal>
    </>
  );
}
