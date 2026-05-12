/**
 * Vitest global setup — runs before every test file (see vitest.config.ts).
 *
 * jsdom doesn't implement `window.matchMedia`; several islands call it on mount
 * (ThemeToggle subscribes to `prefers-color-scheme`, ContactForm gates its GSAP
 * reveal on `prefers-reduced-motion`). Provide a minimal no-op stub so mounting
 * doesn't throw. Tests that care about a specific media query override it.
 */
import { beforeEach, vi } from 'vitest';

function stubMatchMedia(matches = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  stubMatchMedia(false);
  // Each test starts from a clean localStorage + a known <html data-theme>.
  try {
    window.localStorage.clear();
  } catch {
    /* ignore */
  }
  document.documentElement.dataset.theme = 'light';
});
