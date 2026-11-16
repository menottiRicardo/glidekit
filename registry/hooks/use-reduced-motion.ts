import { useReducedMotionConfig } from 'motion/react';

/**
 * True when motion should be reduced: the user's OS setting, or a
 * <MotionConfig reducedMotion="always" | "never"> override from the app.
 */
export function useReducedMotion(): boolean {
  return Boolean(useReducedMotionConfig());
}
