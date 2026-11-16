import type { TargetAndTransition, Transition } from 'motion';

/**
 * Animation presets shared by every component. They are plain objects, so they
 * can be spread onto any motion element and tweaked in one place.
 */
export interface MotionPreset {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition?: Transition;
}

export const transitions = {
  /** Quick and crisp: buttons, toggles, small indicators. */
  snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 },
  /** Default for overlays. */
  smooth: { type: 'spring', stiffness: 360, damping: 32 },
  /** A little overshoot for playful elements. */
  bouncy: { type: 'spring', stiffness: 420, damping: 18 },
  /** Short tween used when motion is reduced. */
  fade: { duration: 0.15, ease: 'linear' },
} satisfies Record<string, Transition>;

export const fade: MotionPreset = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: 'easeOut' },
};

/** Dialogs: grow from slightly smaller while fading in. */
export const scaleIn: MotionPreset = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: 0.12 } },
  transition: transitions.smooth,
};

/** Floating content (popover, menu, select, tooltip). Pair with transformOrigin. */
export const popIn: MotionPreset = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.1 } },
  transition: transitions.snappy,
};

export type Side = 'top' | 'right' | 'bottom' | 'left';

/** Panels that slide in from an edge (drawer). */
export function slideFrom(side: Side): MotionPreset {
  const axis = side === 'left' || side === 'right' ? 'x' : 'y';
  const sign = side === 'left' || side === 'top' ? -1 : 1;
  const offscreen: TargetAndTransition = { [axis]: `${sign * 100}%` };
  return {
    initial: offscreen,
    animate: { [axis]: 0 },
    exit: { ...offscreen, transition: { duration: 0.2, ease: 'easeIn' } },
    transition: transitions.smooth,
  };
}

/** Accordion bodies and other height reveals. */
export const collapse: MotionPreset = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 34 },
};

/** Delay for the nth child of a staggered list, in seconds. */
export function stagger(index: number, step = 0.025, start = 0): number {
  return start + index * step;
}

/** Hover and press feedback for interactive elements. */
export const press = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: transitions.snappy,
} as const;

function opacityOnly(target: TargetAndTransition): TargetAndTransition {
  return 'opacity' in target ? { opacity: target.opacity } : {};
}

/**
 * The same preset with movement removed: only opacity changes. Used when the
 * user asks the system for reduced motion.
 */
export function reduce(preset: MotionPreset): MotionPreset {
  return {
    initial: opacityOnly(preset.initial),
    animate: opacityOnly(preset.animate),
    exit: opacityOnly(preset.exit),
    transition: transitions.fade,
  };
}
