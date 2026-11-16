'use client';

import { toastVariants } from '@/lib/recipes';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { normalizeProps, Portal, useMachine } from '@zag-js/react';
import * as toast from '@zag-js/toast';
import { motion } from 'motion/react';
import { useId, type ReactNode } from 'react';

/**
 * The app-wide toast queue. Call `toaster.success({ title })`, `toaster.error(…)`,
 * `toaster.promise(…)` or `toaster.create({ type, title, description, action })`
 * from anywhere, and render <Toaster /> once near the root.
 */
export const toaster = toast.createStore({
  placement: 'bottom-end',
  overlap: true,
  gap: 12,
  // No queue: updating a queued toast (e.g. a settled promise) would create a
  // duplicate instead. The overlapped stack only shows the front few anyway.
  max: Number.POSITIVE_INFINITY,
  duration: 5000,
});

export interface ToasterProps {
  /** Use a separate store, e.g. for a second region. Defaults to `toaster`. */
  store?: toast.Store;
}

export function Toaster({ store = toaster }: ToasterProps) {
  const service = useMachine(toast.group.machine, { id: useId(), store });
  const api = toast.group.connect(service, normalizeProps);
  return (
    <Portal>
      <div data-slot="toaster" {...api.getGroupProps()}>
        {api.getToasts().map((item, index) => (
          <ToastItem key={item.id} toast={item} index={index} parent={service} />
        ))}
      </div>
    </Portal>
  );
}

type IconType = 'info' | 'success' | 'warning' | 'error' | 'loading';
const ICON_TYPES: readonly string[] = ['info', 'success', 'warning', 'error', 'loading'];

interface ToastItemProps {
  toast: toast.Props;
  index: number;
  parent: toast.GroupService;
}

function ToastItem({ toast: props, index, parent }: ToastItemProps) {
  const service = useMachine(toast.machine, { ...props, index, parent });
  const api = toast.connect(service, normalizeProps);
  const type = (ICON_TYPES.includes(api.type) ? api.type : 'info') as IconType;

  return (
    <div {...api.getRootProps()} className={toastVariants({ type })}>
      <span {...api.getGhostBeforeProps()} />
      <span data-icon className="mt-0.5 shrink-0">
        <ToastIcon type={type} />
      </span>
      <div className="grid min-w-0 flex-1 gap-1">
        {api.title ? (
          <div {...api.getTitleProps()} className="text-sm font-semibold">
            {api.title as ReactNode}
          </div>
        ) : null}
        {api.description ? (
          <div {...api.getDescriptionProps()} className="text-sm text-muted-foreground">
            {api.description as ReactNode}
          </div>
        ) : null}
        {props.action && (
          <button
            {...api.getActionTriggerProps()}
            className="mt-1 w-fit cursor-pointer rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent"
          >
            {props.action.label}
          </button>
        )}
      </div>
      {api.closable && (
        <button
          {...api.getCloseTriggerProps()}
          className="absolute top-2 right-2 cursor-pointer rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
      <span {...api.getGhostAfterProps()} />
    </div>
  );
}

const ICON_PATHS: Record<Exclude<IconType, 'loading'>, string> = {
  success: 'M7.5 12.5l3 3 6-7',
  error: 'M9 9l6 6M15 9l-6 6',
  warning: 'M12 8v5M12 16.5v.01',
  info: 'M12 11v5M12 7.5v.01',
};

function ToastIcon({ type }: { type: IconType }) {
  const reduced = useReducedMotion();
  if (type === 'loading') {
    return (
      <svg viewBox="0 0 24 24" className="size-4.5 animate-spin" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <motion.path
        d={ICON_PATHS[type]}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
      />
    </svg>
  );
}
