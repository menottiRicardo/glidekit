import { act } from '@testing-library/react';

/**
 * Overlays register their dismiss layer (Escape, outside click) one frame after
 * opening. Real users never interact that fast; tests wait for it explicitly.
 */
export async function settle(frames = 2): Promise<void> {
  for (let i = 0; i < frames; i++) {
    await act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  }
}
