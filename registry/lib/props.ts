/**
 * Event handlers whose names clash between DOM attributes and motion's
 * gesture/animation callbacks. Behavior props never set these, so dropping them
 * lets machine props be spread onto motion elements with correct types.
 */
const CONFLICTING = [
  'onAnimationStart',
  'onAnimationEnd',
  'onAnimationIteration',
  'onDrag',
  'onDragStart',
  'onDragEnd',
  'onDragEnter',
  'onDragExit',
  'onDragLeave',
  'onDragOver',
  'onDrop',
] as const;

type Conflicting = (typeof CONFLICTING)[number];

export function forMotion<T extends object>(props: T): Omit<T, Conflicting> {
  const copy = { ...props } as Record<string, unknown>;
  for (const key of CONFLICTING) delete copy[key];
  return copy as Omit<T, Conflicting>;
}
