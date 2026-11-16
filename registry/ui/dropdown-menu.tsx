'use client';

import { cn } from '@/lib/cn';
import { transitions } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { floatingSurface, menuItem } from '@/lib/recipes';
import { Slot } from '@/components/ui/slot';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import * as menu from '@zag-js/menu';
import { mergeProps, normalizeProps, Portal, useMachine } from '@zag-js/react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';

type MenuApi = ReturnType<typeof menu.connect>;

interface MenuContextValue {
  api: MenuApi;
  handlers: Map<string, () => void>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('DropdownMenu parts must be used inside <DropdownMenu>.');
  return ctx;
}

export interface DropdownMenuProps extends Omit<menu.Props, 'id' | 'ids' | 'dir' | 'getRootNode'> {
  children: ReactNode;
}

export function DropdownMenu({ children, onSelect, positioning, ...props }: DropdownMenuProps) {
  const [handlers] = useState(() => new Map<string, () => void>());
  const service = useMachine(menu.machine, {
    id: useId(),
    positioning: { placement: 'bottom-start', gutter: 6, ...positioning },
    onSelect(details) {
      handlers.get(details.value)?.();
      onSelect?.(details);
    },
    ...props,
  });
  const api = menu.connect(service, normalizeProps);
  return <MenuContext.Provider value={{ api, handlers }}>{children}</MenuContext.Provider>;
}

export interface DropdownMenuTriggerProps extends ComponentProps<'button'> {
  asChild?: boolean;
}

export function DropdownMenuTrigger({ asChild, ...props }: DropdownMenuTriggerProps) {
  const { api } = useMenu();
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="dropdown-menu-trigger" {...mergeProps(api.getTriggerProps(), props)} />;
}

const list: Variants = {
  closed: { opacity: 0, scale: 0.96, transition: { duration: 0.1 } },
  open: {
    opacity: 1,
    scale: 1,
    transition: { ...transitions.snappy, staggerChildren: 0.025, delayChildren: 0.02 },
  },
};

const item: Variants = {
  closed: { opacity: 0, y: -4 },
  open: { opacity: 1, y: 0, transition: transitions.snappy },
};

const reducedVariants: Variants = { closed: { opacity: 0 }, open: { opacity: 1 } };

export function DropdownMenuContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { api } = useMenu();
  const reduced = useReducedMotion();
  return (
    <Portal>
      <div {...api.getPositionerProps()}>
        <AnimatePresence>
          {api.open && (
            <motion.div
              data-slot="dropdown-menu-content"
              {...forMotion(api.getContentProps())}
              variants={reduced ? reducedVariants : list}
              initial="closed"
              animate="open"
              exit="closed"
              style={{ transformOrigin: 'var(--transform-origin)' }}
              className={cn(floatingSurface, 'min-w-44 p-1', className)}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Portal>
  );
}

export interface DropdownMenuItemProps {
  value: string;
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  /** Keyboard shortcut hint shown on the right. */
  shortcut?: ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}

export function DropdownMenuItem({
  value,
  children,
  onSelect,
  disabled,
  shortcut,
  variant = 'default',
  className,
}: DropdownMenuItemProps) {
  const { api, handlers } = useMenu();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!onSelect) return;
    handlers.set(value, onSelect);
    return () => {
      handlers.delete(value);
    };
  }, [handlers, value, onSelect]);

  return (
    <motion.div
      data-slot="dropdown-menu-item"
      {...forMotion(api.getItemProps({ value, disabled }))}
      variants={reduced ? reducedVariants : item}
      className={cn(
        menuItem,
        variant === 'destructive' &&
          'text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive',
        className,
      )}
    >
      {children}
      {shortcut && (
        <span className="ml-auto pl-4 text-xs tracking-widest text-muted-foreground">
          {shortcut}
        </span>
      )}
    </motion.div>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  const { api } = useMenu();
  return <hr {...api.getSeparatorProps()} className={cn('-mx-1 my-1 border-border', className)} />;
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}
