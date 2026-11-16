'use client';

import { cn } from '@/lib/cn';
import { fade, scaleIn } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { usePreset } from '@/hooks/use-preset';
import { Slot } from '@/components/ui/slot';
import * as dialog from '@zag-js/dialog';
import { mergeProps, normalizeProps, Portal, useMachine } from '@zag-js/react';
import { AnimatePresence, motion } from 'motion/react';
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';

type DialogApi = ReturnType<typeof dialog.connect>;
const DialogContext = createContext<DialogApi | null>(null);

export function useDialog(): DialogApi {
  const api = useContext(DialogContext);
  if (!api) throw new Error('Dialog parts must be used inside <Dialog>.');
  return api;
}

export interface DialogProps extends Omit<dialog.Props, 'id' | 'ids' | 'dir' | 'getRootNode'> {
  children: ReactNode;
}

export function Dialog({ children, ...props }: DialogProps) {
  const service = useMachine(dialog.machine, { id: useId(), ...props });
  const api = dialog.connect(service, normalizeProps);
  return <DialogContext.Provider value={api}>{children}</DialogContext.Provider>;
}

export interface DialogTriggerProps extends ComponentProps<'button'> {
  /** Merge trigger behavior into the child element instead of rendering a button. */
  asChild?: boolean;
}

export function DialogTrigger({ asChild, ...props }: DialogTriggerProps) {
  const api = useDialog();
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="dialog-trigger" {...mergeProps(api.getTriggerProps(), props)} />;
}

export function DialogBackdrop({ className }: { className?: string }) {
  const api = useDialog();
  const preset = usePreset(fade);
  return (
    <AnimatePresence>
      {api.open && (
        <motion.div
          {...forMotion(api.getBackdropProps())}
          {...preset}
          className={cn('fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]', className)}
        />
      )}
    </AnimatePresence>
  );
}

export interface DialogContentProps {
  children: ReactNode;
  className?: string;
  /** Render the × button in the corner. */
  showClose?: boolean;
}

export function DialogContent({ children, className, showClose = true }: DialogContentProps) {
  const api = useDialog();
  const preset = usePreset(scaleIn);
  return (
    <Portal>
      <DialogBackdrop />
      <div
        {...api.getPositionerProps()}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <AnimatePresence>
          {api.open && (
            <motion.div
              data-slot="dialog-content"
              {...forMotion(api.getContentProps())}
              {...preset}
              className={cn(
                'relative grid w-full max-w-lg gap-4 rounded-xl border bg-background p-6 shadow-xl outline-none',
                className,
              )}
            >
              {children}
              {showClose && (
                <button
                  {...api.getCloseTriggerProps()}
                  aria-label="Close"
                  className="absolute top-3.5 right-3.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                  <CloseIcon />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('grid gap-1.5 pr-6', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<'h2'>) {
  const api = useDialog();
  return (
    <h2
      {...api.getTitleProps()}
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: ComponentProps<'p'>) {
  const api = useDialog();
  return (
    <p
      {...api.getDescriptionProps()}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export interface DialogCloseProps extends ComponentProps<'button'> {
  asChild?: boolean;
}

export function DialogClose({ asChild, ...props }: DialogCloseProps) {
  const api = useDialog();
  const Comp = asChild ? Slot : 'button';
  return <Comp {...mergeProps(api.getCloseTriggerProps(), props)} />;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
