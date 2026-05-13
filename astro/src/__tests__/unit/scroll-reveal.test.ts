import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// `scroll-reveal.ts` keeps an `inited` flag at module scope and auto-invokes
// `initScrollReveal()` on import. To exercise each branch we reset the module
// graph between tests and dynamic-import after staging the environment.

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

function setReadyState(state: DocumentReadyState): void {
  Object.defineProperty(document, 'readyState', {
    configurable: true,
    get: () => state,
  });
}

function setCSSSupports(supports: (s: string) => boolean): void {
  Object.defineProperty(window, 'CSS', {
    writable: true,
    configurable: true,
    value: { supports },
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

/** Drains rAF callbacks immediately so the test stays synchronous. */
function stubImmediateRAF(): void {
  vi.stubGlobal(
    'requestAnimationFrame',
    ((cb: FrameRequestCallback) => {
      cb(0);
      return 0 as unknown as number;
    }) as typeof requestAnimationFrame,
  );
}

interface FakeIO {
  callback: IntersectionObserverCallback;
  observed: Element[];
  unobserved: Element[];
  fire: (entries: Partial<IntersectionObserverEntry>[]) => void;
}

function makeFakeIOFactory(): { Ctor: typeof IntersectionObserver; instances: FakeIO[] } {
  const instances: FakeIO[] = [];
  class IO {
    callback: IntersectionObserverCallback;
    observed: Element[] = [];
    unobserved: Element[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(cb: IntersectionObserverCallback, _opts?: any) {
      this.callback = cb;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      instances.push(this as any);
    }
    observe(el: Element): void {
      this.observed.push(el);
    }
    unobserve(el: Element): void {
      this.unobserved.push(el);
    }
    disconnect(): void {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    takeRecords(): any[] {
      return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fire(entries: any[]): void {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.callback(entries as any, this as any);
    }
  }
  return { Ctor: IO as unknown as typeof IntersectionObserver, instances };
}

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '';
  setMatchMedia(false);
  setReadyState('complete');
  setCSSSupports(() => false);
  setIntersectionObserver(undefined);
  stubImmediateRAF();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('scroll-reveal — reduced-motion / no-IO fast path', () => {
  it('immediately marks every [data-reveal] as revealed under prefers-reduced-motion', async () => {
    setMatchMedia(true);
    document.body.innerHTML = `
      <div data-reveal id="a"></div>
      <div data-reveal id="b"></div>
      <p>not revealed</p>
    `;
    await import('../../scripts/scroll-reveal');
    expect(document.getElementById('a')!.classList.contains('is-revealed')).toBe(true);
    expect(document.getElementById('b')!.classList.contains('is-revealed')).toBe(true);
    expect(document.querySelector('p')!.classList.contains('is-revealed')).toBe(false);
  });

  it('falls back to the same immediate path when IntersectionObserver is unavailable', async () => {
    document.body.innerHTML = `<div data-reveal id="a"></div>`;
    setIntersectionObserver(undefined);
    await import('../../scripts/scroll-reveal');
    expect(document.getElementById('a')!.classList.contains('is-revealed')).toBe(true);
  });
});

describe('scroll-reveal — CSS animation-timeline path', () => {
  it('returns without touching the DOM when the browser supports animation-timeline: view()', async () => {
    document.body.innerHTML = `<div data-reveal id="a"></div>`;
    setCSSSupports((q: string) => q === 'animation-timeline: view()');
    // IO must be available (otherwise the reduced/no-IO fast path runs first).
    const { Ctor, instances } = makeFakeIOFactory();
    setIntersectionObserver(Ctor);
    await import('../../scripts/scroll-reveal');
    // No class added, no observer constructed.
    expect(document.getElementById('a')!.classList.contains('is-revealed')).toBe(false);
    expect(instances).toHaveLength(0);
  });
});

describe('scroll-reveal — IntersectionObserver fallback (no CSS view-timeline)', () => {
  it('reveals a single non-grouped item once it intersects', async () => {
    document.body.innerHTML = `<div data-reveal id="solo"></div>`;
    const { Ctor, instances } = makeFakeIOFactory();
    setIntersectionObserver(Ctor);
    await import('../../scripts/scroll-reveal');
    // Two observers always exist (group + item) — the item observer is the
    // second one. It's the one watching the solo element.
    expect(instances.length).toBe(2);
    const itemObserver = instances[1];
    expect(itemObserver.observed.map((el) => (el as HTMLElement).id)).toEqual(['solo']);
    // Before intersection: no class.
    expect(document.getElementById('solo')!.classList.contains('is-revealed')).toBe(false);
    itemObserver.fire([{ target: document.getElementById('solo')!, isIntersecting: true }]);
    expect(document.getElementById('solo')!.classList.contains('is-revealed')).toBe(true);
    expect(itemObserver.unobserved.length).toBe(1);
  });

  it('reveals every direct [data-reveal] child of a [data-reveal-stagger] group with a 90ms cascade', async () => {
    document.body.innerHTML = `
      <div data-reveal-stagger id="group">
        <div data-reveal id="c1"></div>
        <div data-reveal id="c2"></div>
        <div data-reveal id="c3"></div>
      </div>
    `;
    const { Ctor, instances } = makeFakeIOFactory();
    setIntersectionObserver(Ctor);
    await import('../../scripts/scroll-reveal');
    const [groupObserver] = instances;
    expect(groupObserver.observed.map((el) => (el as HTMLElement).id)).toEqual(['group']);
    groupObserver.fire([{ target: document.getElementById('group')!, isIntersecting: true }]);
    const c1 = document.getElementById('c1')!;
    const c2 = document.getElementById('c2')!;
    const c3 = document.getElementById('c3')!;
    expect(c1.classList.contains('is-revealed')).toBe(true);
    expect(c2.classList.contains('is-revealed')).toBe(true);
    expect(c3.classList.contains('is-revealed')).toBe(true);
    // First child no delay; subsequent ones at i * 90ms.
    expect(c1.style.transitionDelay).toBe('');
    expect(c2.style.transitionDelay).toBe('90ms');
    expect(c3.style.transitionDelay).toBe('180ms');
  });

  it('does NOT double-reveal a child that belongs to a stagger group via the item observer', async () => {
    document.body.innerHTML = `
      <div data-reveal-stagger id="group">
        <div data-reveal id="c1"></div>
      </div>
      <div data-reveal id="solo"></div>
    `;
    const { Ctor, instances } = makeFakeIOFactory();
    setIntersectionObserver(Ctor);
    await import('../../scripts/scroll-reveal');
    const [groupObserver, itemObserver] = instances;
    // Group claims its direct child; item observer only watches `solo`.
    expect(groupObserver.observed.map((el) => (el as HTMLElement).id)).toEqual(['group']);
    expect(itemObserver.observed.map((el) => (el as HTMLElement).id)).toEqual(['solo']);
  });

  it('ignores entries that are not intersecting', async () => {
    document.body.innerHTML = `<div data-reveal id="a"></div>`;
    const { Ctor, instances } = makeFakeIOFactory();
    setIntersectionObserver(Ctor);
    await import('../../scripts/scroll-reveal');
    const itemObserver = instances[1];
    itemObserver.fire([{ target: document.getElementById('a')!, isIntersecting: false }]);
    expect(document.getElementById('a')!.classList.contains('is-revealed')).toBe(false);
    expect(itemObserver.unobserved.length).toBe(0);
  });

  it('skips empty stagger groups (no [data-reveal] children) without registering an observer', async () => {
    document.body.innerHTML = `
      <div data-reveal-stagger id="empty"></div>
      <div data-reveal id="solo"></div>
    `;
    const { Ctor, instances } = makeFakeIOFactory();
    setIntersectionObserver(Ctor);
    await import('../../scripts/scroll-reveal');
    const [groupObserver, itemObserver] = instances;
    expect(groupObserver.observed).toEqual([]);
    expect(itemObserver.observed.map((el) => (el as HTMLElement).id)).toEqual(['solo']);
  });
});

describe('scroll-reveal — init scheduling', () => {
  it('defers reveal() until DOMContentLoaded when the document is still loading', async () => {
    setReadyState('loading');
    const addEventSpy = vi.spyOn(document, 'addEventListener');
    document.body.innerHTML = `<div data-reveal id="a"></div>`;
    setMatchMedia(true); // make reveal() a no-cost branch we can detect
    await import('../../scripts/scroll-reveal');
    // Nothing happened yet — the listener is registered but not fired.
    expect(document.getElementById('a')!.classList.contains('is-revealed')).toBe(false);
    expect(addEventSpy).toHaveBeenCalled();
    const call = addEventSpy.mock.calls.find((c) => c[0] === 'DOMContentLoaded');
    expect(call).toBeDefined();
    // Now fire the listener manually.
    const handler = call![1] as () => void;
    handler();
    expect(document.getElementById('a')!.classList.contains('is-revealed')).toBe(true);
  });

  it('is idempotent — re-running initScrollReveal() does nothing the second time', async () => {
    document.body.innerHTML = `<div data-reveal id="a"></div>`;
    const { Ctor, instances } = makeFakeIOFactory();
    setIntersectionObserver(Ctor);
    const mod = await import('../../scripts/scroll-reveal');
    const observersBefore = instances.length;
    mod.initScrollReveal();
    mod.initScrollReveal();
    // No new observers — the `inited` guard short-circuits subsequent runs.
    expect(instances.length).toBe(observersBefore);
  });
});
