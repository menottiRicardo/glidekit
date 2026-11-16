'use client';

import { cn } from '@/lib/cn';
import { popIn } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { floatingSurface } from '@/lib/recipes';
import { usePreset } from '@/hooks/use-preset';
import { Slot } from '@/components/ui/slot';
import * as popover from '@zag-js/popover';
import { mergeProps, normalizeProps, Portal, useMachine } from '@zag-js/react';
import { AnimatePresence, motion } from 'motion/react';
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';

type PopoverApi = ReturnType<typeof popover.connect>;
const PopoverContext = createContext<PopoverApi | null>(null);

export function usePopover(): PopoverApi {
  const api = useContext(PopoverContext);
  if (!api) throw new Error('Popover parts must be used inside <Popover>.');
  return api;
}

export interface PopoverProps extends Omit<popover.Props, 'id' | 'ids' | 'dir' | 'getRootNode'> {
  children: ReactNode;
}

export function Popover({ children, positioning, ...props }: PopoverProps) {
  const service = useMachine(popover.machine, {
    id: useId(),
    positioning: { placement: 'bottom', gutter: 8, ...positioning },
    ...props,
  });
  const api = popover.connect(service, normalizeProps);
  return <PopoverContext.Provider value={api}>{children}</PopoverContext.Provider>;
}

export interface PopoverTriggerProps extends ComponentProps<'button'> {
  asChild?: boolean;
}

export function PopoverTrigger({ asChild, ...props }: PopoverTriggerProps) {
  const api = usePopover();
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="popover-trigger" {...mergeProps(api.getTriggerProps(), props)} />;
}

export interface PopoverContentProps {
  children: ReactNode;
  className?: string;
}

export function PopoverContent({ children, className }: PopoverContentProps) {
  const api = usePopover();
  const preset = usePreset(popIn);
  const content = (
    <div {...api.getPositionerProps()}>
      <AnimatePresence>
        {api.open && (
          <motion.div
            data-slot="popover-content"
            {...forMotion(api.getContentProps())}
            {...preset}
            style={{ transformOrigin: 'var(--transform-origin)' }}
            className={cn(floatingSurface, 'w-72 p-4', className)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  return api.portalled ? <Portal>{content}</Portal> : content;
}

export function PopoverTitle({ className, ...props }: ComponentProps<'h3'>) {
  const api = usePopover();
  return <h3 {...api.getTitleProps()} className={cn('font-semibold', className)} {...props} />;
}

export function PopoverDescription({ className, ...props }: ComponentProps<'p'>) {
  const api = usePopover();
  return (
    <p
      {...api.getDescriptionProps()}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function PopoverClose({ asChild, ...props }: PopoverTriggerProps) {
  const api = usePopover();
  const Comp = asChild ? Slot : 'button';
  return <Comp {...mergeProps(api.getCloseTriggerProps(), props)} />;
}
