import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { MotionGlobalConfig } from 'motion/react';
import { afterEach, vi } from 'vitest';

// CLI tests run in a node environment; everything below needs a DOM.
if (typeof window !== 'undefined') {
  // Animations finish instantly in tests; behavior is what we assert on.
  MotionGlobalConfig.skipAnimations = true;

  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  class IntersectionObserverStub {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.callback(
        [{ isIntersecting: true, target, intersectionRatio: 1 } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  Object.assign(globalThis, {
    ResizeObserver: globalThis.ResizeObserver ?? ResizeObserverStub,
    IntersectionObserver: IntersectionObserverStub,
  });

  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }

  Element.prototype.scrollIntoView ??= function () {};
  Element.prototype.scrollTo ??= function () {};
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};

  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  afterEach(async () => {
    vi.useRealTimers();
    cleanup();
    // Overlay machines release layers, scroll locks and inert siblings a frame
    // after unmount; let that finish so tests do not leak into each other.
    await nextFrame();
    await nextFrame();
    document.body.innerHTML = '';
    document.body.removeAttribute('style');
  });
}
