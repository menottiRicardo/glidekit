import { reduce, type MotionPreset } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/** Returns the preset, or an opacity-only version when the user prefers reduced motion. */
export function usePreset(preset: MotionPreset): MotionPreset {
  const reduced = useReducedMotion();
  return reduced ? reduce(preset) : preset;
}
