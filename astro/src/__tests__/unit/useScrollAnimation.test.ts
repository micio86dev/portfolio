import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';

// `useScrollAnimation` captures `prefers-reduced-motion` and
// `IntersectionObserver` support at MODULE-LOAD time (top-level constants). To
// exercise both branches we vi.resetModules() between tests and dynamic-import
// the composable AFTER tweaking the environment.

function setMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((q: string) => ({
      matches,
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function setIntersectionObserver(impl: typeof IntersectionObserver | undefined): void {
  if (impl === undefined) {
    delete (globalThis as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
  } else {
    (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
      impl;
  }
}

/**
 * Mounts a throwaway component that calls `useScrollAnimation()` in its setup
 * (so `onBeforeUnmount` is registered against a real Vue instance) and returns
 * the wrapper plus the composable's `animateOnScroll` handle. The component
 * itself renders nothing — every target is created outside the wrapper.
 */
type Composable = typeof import('../../composables/useScrollAnimation');
type Handle = ReturnType<Composable['useScrollAnimation']>;

async function mountWithComposable(): Promise<{
  wrapper: ReturnType<typeof mount>;
  animateOnScroll: Handle['animateOnScroll'];
}> {
  const mod: Composable = await import('../../composables/useScrollAnimation');
  let handle: Handle | null = null;
  const Comp = defineComponent({
    setup() {
      handle = mod.useScrollAnimation();
      return () => h('div');
    },
  });
  const wrapper = mount(Comp);
  // Vue's setup() runs synchronously during mount, so `handle` is populated by
  // the time we get here. The type-system can't see that side-effect across
  // the closure, hence the local assertion.
  const captured = handle as Handle | null;
  if (!captured) throw new Error('useScrollAnimation handle was not captured');
  return { wrapper, animateOnScroll: captured.animateOnScroll };
}

beforeEach(() => {
  vi.resetModules();
  setMatchMedia(false);
  setIntersectionObserver(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useScrollAnimation — no-op cases', () => {
  it('does nothing when prefers-reduced-motion is set', async () => {
    setMatchMedia(true);
    const { animateOnScroll } = await mountWithComposable();
    const el = document.createElement('div');
    animateOnScroll(el);
    // Under reduced-motion no styles are written at all.
    expect(el.style.opacity).toBe('');
    expect(el.style.transform).toBe('');
    expect(el.style.transition).toBe('');
  });

  it('does nothing when the target is null or undefined', async () => {
    const { animateOnScroll } = await mountWithComposable();
    expect(() => animateOnScroll(null)).not.toThrow();
    expect(() => animateOnScroll(undefined)).not.toThrow();
  });

  it('does nothing when the target list is empty', async () => {
    const { animateOnScroll } = await mountWithComposable();
    expect(() => animateOnScroll([])).not.toThrow();
    // Also: empty NodeList from querySelectorAll
    const empty = document.querySelectorAll('.absent');
    expect(() => animateOnScroll(empty)).not.toThrow();
  });
});

describe('useScrollAnimation — fallback when IO is unavailable', () => {
  it('writes the start state synchronously and settles to the end state on rAF', async () => {
    // Run rAF eagerly so the test stays synchronous after a flush.
    vi.stubGlobal(
      'requestAnimationFrame',
      ((cb: FrameRequestCallback) => {
        cb(0);
        return 0 as unknown as number;
      }) as typeof requestAnimationFrame,
    );
    const { animateOnScroll } = await mountWithComposable();
    const el = document.createElement('div');
    animateOnScroll(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0 });
    // After the rAF runs, the element is at the end state.
    expect(el.style.opacity).toBe('1');
    expect(el.style.transform).toBe('translateY(0px)');
    expect(el.style.transition).toContain('opacity 500ms');
  });

  it('honours custom fromVars defaults when only some keys are provided', async () => {
    vi.stubGlobal('requestAnimationFrame', ((cb: FrameRequestCallback) => {
      cb(0);
      return 0 as unknown as number;
    }) as typeof requestAnimationFrame);
    const { animateOnScroll } = await mountWithComposable();
    const el = document.createElement('div');
    // Empty fromVars → defaults (opacity:0, y:30). Empty toVars → (1, 0).
    animateOnScroll(el, {}, {});
    expect(el.style.opacity).toBe('1');
    expect(el.style.transform).toBe('translateY(0px)');
  });
});

describe('useScrollAnimation — IntersectionObserver path', () => {
  let observed: Element[] = [];
  let unobserved: Element[] = [];
  let observerCallback: IntersectionObserverCallback | null = null;
  let lastObserver: IntersectionObserver | null = null;
  let disconnectCalls = 0;

  beforeEach(() => {
    observed = [];
    unobserved = [];
    observerCallback = null;
    lastObserver = null;
    disconnectCalls = 0;
    class FakeIO {
      callback: IntersectionObserverCallback;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(cb: IntersectionObserverCallback, _opts?: any) {
        this.callback = cb;
        observerCallback = cb;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastObserver = this as any;
      }
      observe(el: Element): void {
        observed.push(el);
      }
      unobserve(el: Element): void {
        unobserved.push(el);
      }
      disconnect(): void {
        disconnectCalls++;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      takeRecords(): any[] {
        return [];
      }
    }
    setIntersectionObserver(FakeIO as unknown as typeof IntersectionObserver);
  });

  it('observes every target and applies the end state on intersection', async () => {
    const { animateOnScroll } = await mountWithComposable();
    const a = document.createElement('div');
    const b = document.createElement('div');
    animateOnScroll([a, b], { opacity: 0, y: 16 }, { opacity: 1, y: 0 });
    expect(observed).toEqual([a, b]);
    // Start state is inline already.
    expect(a.style.opacity).toBe('0');
    expect(a.style.transform).toBe('translateY(16px)');
    // Fire the IO entries → end state.
    observerCallback!(
      [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { target: a, isIntersecting: true } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { target: b, isIntersecting: true } as any,
      ],
      lastObserver as IntersectionObserver,
    );
    expect(a.style.opacity).toBe('1');
    expect(a.style.transform).toBe('translateY(0px)');
    expect(b.style.opacity).toBe('1');
    // Both targets are unobserved after firing.
    expect(unobserved).toEqual([a, b]);
  });

  it('applies stagger delay to every non-first target', async () => {
    const { animateOnScroll } = await mountWithComposable();
    const a = document.createElement('div');
    const b = document.createElement('div');
    const c = document.createElement('div');
    animateOnScroll([a, b, c], undefined, undefined, { stagger: 0.1 });
    observerCallback!(
      [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { target: a, isIntersecting: true } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { target: b, isIntersecting: true } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { target: c, isIntersecting: true } as any,
      ],
      lastObserver as IntersectionObserver,
    );
    // First gets no delay, second gets 100ms, third gets 200ms.
    expect(a.style.transitionDelay).toBe('');
    expect(b.style.transitionDelay).toBe('100ms');
    expect(c.style.transitionDelay).toBe('200ms');
  });

  it('ignores entries that are not intersecting', async () => {
    const { animateOnScroll } = await mountWithComposable();
    const a = document.createElement('div');
    animateOnScroll(a, { opacity: 0 }, { opacity: 1 });
    expect(a.style.opacity).toBe('0');
    observerCallback!(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [{ target: a, isIntersecting: false } as any],
      lastObserver as IntersectionObserver,
    );
    // Still at the start state.
    expect(a.style.opacity).toBe('0');
    expect(unobserved).toEqual([]);
  });

  it('accepts a single Element (not just a list)', async () => {
    const { animateOnScroll } = await mountWithComposable();
    const el = document.createElement('div');
    animateOnScroll(el);
    expect(observed).toEqual([el]);
  });

  it('disconnects every observer on unmount', async () => {
    const { wrapper, animateOnScroll } = await mountWithComposable();
    animateOnScroll([document.createElement('div')]);
    animateOnScroll([document.createElement('div')]);
    // Two animateOnScroll calls → two observers.
    wrapper.unmount();
    expect(disconnectCalls).toBe(2);
  });
});
