'use client';

import { cn } from '@/lib/cn';
import { slideFrom, type Side } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { usePreset } from '@/hooks/use-preset';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  useDialog,
} from '@/components/ui/dialog';
import { Portal } from '@zag-js/react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import type { ComponentProps, ReactNode } from 'react';

export {
  Dialog as Drawer,
  DialogTrigger as DrawerTrigger,
  DialogTitle as DrawerTitle,
  DialogDescription as DrawerDescription,
  DialogClose as DrawerClose,
};

const placement: Record<Side, string> = {
  bottom: 'items-end justify-center',
  top: 'items-start justify-center',
  left: 'items-stretch justify-start',
  right: 'items-stretch justify-end',
};

const panel: Record<Side, string> = {
  bottom: 'w-full max-h-[85vh] rounded-t-2xl border-t',
  top: 'w-full max-h-[85vh] rounded-b-2xl border-b',
  left: 'h-full w-[min(380px,90vw)] border-r',
  right: 'h-full w-[min(380px,90vw)] border-l',
};

/** Distance (px) or speed (px/s) past which releasing a drag closes the drawer. */
const CLOSE_DISTANCE = 100;
const CLOSE_VELOCITY = 500;

export function shouldClose(side: Side, info: Pick<PanInfo, 'offset' | 'velocity'>): boolean {
  const horizontal = side === 'left' || side === 'right';
  const sign = side === 'right' || side === 'bottom' ? 1 : -1;
  const offset = (horizontal ? info.offset.x : info.offset.y) * sign;
  const velocity = (horizontal ? info.velocity.x : info.velocity.y) * sign;
  return offset > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY;
}

export interface DrawerContentProps {
  children: ReactNode;
  side?: Side;
  className?: string;
  /** Let users drag the panel toward its edge to close it. */
  draggable?: boolean;
}

export function DrawerContent({
  children,
  side = 'bottom',
  className,
  draggable = true,
}: DrawerContentProps) {
  const api = useDialog();
  const preset = usePreset(slideFrom(side));
  const reduced = useReducedMotion();
  const horizontal = side === 'left' || side === 'right';
  const canDrag = draggable && !reduced;

  return (
    <Portal>
      <DialogBackdrop />
      <div {...api.getPositionerProps()} className={cn('fixed inset-0 z-50 flex', placement[side])}>
        <AnimatePresence>
          {api.open && (
            <motion.div
              data-slot="drawer-content"
              data-side={side}
              {...forMotion(api.getContentProps())}
              {...preset}
              drag={canDrag ? (horizontal ? 'x' : 'y') : false}
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={{
                top: side === 'top' ? 0.6 : 0.05,
                bottom: side === 'bottom' ? 0.6 : 0.05,
                left: side === 'left' ? 0.6 : 0.05,
                right: side === 'right' ? 0.6 : 0.05,
              }}
              onDragEnd={(_, info) => {
                if (shouldClose(side, info)) api.setOpen(false);
              }}
              className={cn(
                'relative flex flex-col gap-4 overflow-y-auto bg-background p-6 shadow-xl outline-none',
                panel[side],
                className,
              )}
            >
              {side === 'bottom' && canDrag && (
                <div
                  aria-hidden
                  className="mx-auto -mt-2 mb-1 h-1.5 w-10 shrink-0 cursor-grab rounded-full bg-muted active:cursor-grabbing"
                />
              )}
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Portal>
  );
}

export function DrawerHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('grid gap-1.5', className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mt-auto flex flex-col gap-2', className)} {...props} />;
}
