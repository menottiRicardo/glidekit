import { mergeProps } from '@zag-js/react';
import { cloneElement, isValidElement, type HTMLAttributes, type ReactNode } from 'react';

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Renders its only child with the slot's props merged in (event handlers are
 * chained, class names joined). Powers the `asChild` prop on triggers.
 */
export function Slot({ children, ...props }: SlotProps) {
  if (!isValidElement<Record<string, unknown>>(children)) return null;
  return cloneElement(children, mergeProps(props, children.props));
}
