'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { focusRing } from '@/lib/recipes';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { normalizeProps, useMachine } from '@zag-js/react';
import * as tabs from '@zag-js/tabs';
import { LayoutGroup, motion } from 'motion/react';
import { createContext, useContext, useId, type ReactNode } from 'react';

type TabsApi = ReturnType<typeof tabs.connect>;
type Variant = 'pill' | 'underline';

const TabsContext = createContext<{ api: TabsApi; variant: Variant } | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs parts must be used inside <Tabs>.');
  return ctx;
}

export interface TabsProps extends Omit<tabs.Props, 'id' | 'ids' | 'dir' | 'getRootNode'> {
  children: ReactNode;
  className?: string;
  /** "pill" slides a filled background; "underline" slides a bar under the active tab. */
  variant?: Variant;
}

export function Tabs({ children, className, variant = 'pill', ...props }: TabsProps) {
  const id = useId();
  const service = useMachine(tabs.machine, { id, ...props });
  const api = tabs.connect(service, normalizeProps);
  return (
    <TabsContext.Provider value={{ api, variant }}>
      <LayoutGroup id={id}>
        <div
          data-slot="tabs"
          {...api.getRootProps()}
          className={cn('flex gap-3 data-[orientation=horizontal]:flex-col', className)}
        >
          {children}
        </div>
      </LayoutGroup>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  const { api, variant } = useTabs();
  return (
    <div
      {...api.getListProps()}
      className={cn(
        'inline-flex w-fit max-w-full items-center overflow-x-auto',
        variant === 'pill' ? 'gap-1 rounded-lg bg-muted p-1' : 'gap-4 border-b',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function TabsTrigger({ value, children, disabled, className }: TabsTriggerProps) {
  const { api, variant } = useTabs();
  const reduced = useReducedMotion();
  return (
    <button
      {...api.getTriggerProps({ value, disabled })}
      className={cn(
        'relative inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors',
        'text-muted-foreground hover:text-foreground data-selected:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
        variant === 'pill' ? 'h-8 rounded-md px-3' : 'h-9 px-1',
        focusRing,
        className,
      )}
    >
      {api.value === value && (
        <motion.span
          layoutId="indicator"
          aria-hidden
          transition={reduced ? { duration: 0 } : transitions.smooth}
          className={cn(
            'absolute',
            variant === 'pill'
              ? 'inset-0 rounded-md bg-background shadow-sm'
              : 'inset-x-0 bottom-0 h-0.5 rounded-full bg-primary',
          )}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { api } = useTabs();
  const reduced = useReducedMotion();
  return (
    <div {...api.getContentProps({ value })} className={cn(focusRing, className)}>
      {api.value === value && (
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? transitions.fade : transitions.smooth}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
