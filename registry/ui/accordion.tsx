'use client';

import { cn } from '@/lib/cn';
import { collapse, transitions } from '@/lib/motion';
import { focusRing } from '@/lib/recipes';
import { usePreset } from '@/hooks/use-preset';
import * as accordion from '@zag-js/accordion';
import { normalizeProps, useMachine } from '@zag-js/react';
import { AnimatePresence, motion } from 'motion/react';
import { createContext, useContext, useId, type ReactNode } from 'react';

type AccordionApi = ReturnType<typeof accordion.connect>;
const AccordionContext = createContext<AccordionApi | null>(null);
const ItemContext = createContext<{ value: string; disabled?: boolean } | null>(null);

function useAccordion(): AccordionApi {
  const api = useContext(AccordionContext);
  if (!api) throw new Error('Accordion parts must be used inside <Accordion>.');
  return api;
}

function useItem() {
  const item = useContext(ItemContext);
  if (!item) throw new Error('Use AccordionTrigger/AccordionContent inside <AccordionItem>.');
  return item;
}

export interface AccordionProps extends Omit<
  accordion.Props,
  'id' | 'ids' | 'dir' | 'getRootNode'
> {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className, collapsible = true, ...props }: AccordionProps) {
  const service = useMachine(accordion.machine, { id: useId(), collapsible, ...props });
  const api = accordion.connect(service, normalizeProps);
  return (
    <AccordionContext.Provider value={api}>
      <div data-slot="accordion" {...api.getRootProps()} className={cn('w-full', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, disabled, children, className }: AccordionItemProps) {
  const api = useAccordion();
  return (
    <ItemContext.Provider value={{ value, disabled }}>
      <div {...api.getItemProps({ value, disabled })} className={cn('border-b', className)}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const api = useAccordion();
  const item = useItem();
  const { expanded } = api.getItemState(item);
  return (
    <h3 className="flex">
      <button
        {...api.getItemTriggerProps(item)}
        className={cn(
          'flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium',
          'hover:underline disabled:pointer-events-none disabled:opacity-50',
          focusRing,
          className,
        )}
      >
        {children}
        <motion.svg
          viewBox="0 0 16 16"
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={transitions.snappy}
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </motion.svg>
      </button>
    </h3>
  );
}

export function AccordionContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const api = useAccordion();
  const item = useItem();
  const { expanded } = api.getItemState(item);
  const preset = usePreset(collapse);
  // The machine hides collapsed content right away; keep the region visible so
  // the height animation can play, and let presence decide what is rendered.
  return (
    <div {...api.getItemContentProps(item)} hidden={false}>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div {...preset} className="overflow-hidden">
            <div className={cn('pb-4 text-sm text-muted-foreground', className)}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
