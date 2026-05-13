import { onBeforeUnmount } from 'vue';

type Vars = Record<string, unknown>;

interface AnimateOpts extends Vars {
  /** stagger seconds when `el` is a list / NodeList */
  stagger?: number;
}

type Target = Element | Element[] | NodeListOf<Element> | null | undefined;

const REDUCED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SUPPORTS_IO = typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined';

/**
 * Reusable scroll-reveal helper for Vue islands.
 *
 * IntersectionObserver + per-element CSS transition. The call signature matches
 * the previous GSAP-backed version (`animateOnScroll(el, fromVars?, toVars?,
 * opts?)`) — only the (opacity, y) axes are honoured, which is all our call
 * sites use. Implemented this way because ScrollTrigger reads layout for every
 * registered target right after writing the start-state, forcing a synchronous
 * reflow PageSpeed flagged on the home view; IO does intersection work off the
 * layout path, so the cost is effectively zero.
 *
 * No-op under `prefers-reduced-motion: reduce` — elements stay in their natural
 * (fully visible) state, so there is never a stuck `opacity: 0`. Only `opacity`
 * and `transform` are animated → no layout shift.
 */
export function useScrollAnimation() {
  const observers: IntersectionObserver[] = [];

  function animateOnScroll(
    el: Target,
    fromVars: Vars = { opacity: 0, y: 30 },
    toVars: Vars = { opacity: 1, y: 0 },
    opts: AnimateOpts = {},
  ): void {
    if (REDUCED || !el) return;
    const targets =
      el instanceof Element ? [el] : Array.from(el as ArrayLike<Element>);
    if (targets.length === 0) return;

    const fromOpacity = typeof fromVars.opacity === 'number' ? fromVars.opacity : 0;
    const fromY = typeof fromVars.y === 'number' ? fromVars.y : 30;
    const toOpacity = typeof toVars.opacity === 'number' ? toVars.opacity : 1;
    const toY = typeof toVars.y === 'number' ? toVars.y : 0;
    const stagger = typeof opts.stagger === 'number' ? opts.stagger : 0;

    // Apply the start-state inline — works even when the global CSS reveal
    // rules don't target these elements (the form fields here aren't
    // `[data-reveal]`).
    targets.forEach((t) => {
      const node = t as HTMLElement;
      node.style.opacity = String(fromOpacity);
      node.style.transform = `translateY(${fromY}px)`;
      node.style.transition =
        'opacity 500ms cubic-bezier(.2,.7,.3,1), transform 500ms cubic-bezier(.2,.7,.3,1)';
    });

    // No IO support → just settle to the end-state on next frame.
    if (!SUPPORTS_IO) {
      requestAnimationFrame(() => {
        targets.forEach((t) => {
          const node = t as HTMLElement;
          node.style.opacity = String(toOpacity);
          node.style.transform = `translateY(${toY}px)`;
        });
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = targets.indexOf(entry.target);
          const node = entry.target as HTMLElement;
          const delayMs = stagger > 0 && i > 0 ? Math.round(i * stagger * 1000) : 0;
          if (delayMs > 0) node.style.transitionDelay = `${delayMs}ms`;
          node.style.opacity = String(toOpacity);
          node.style.transform = `translateY(${toY}px)`;
          obs.unobserve(node);
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    targets.forEach((t) => io.observe(t));
    observers.push(io);
  }

  onBeforeUnmount(() => {
    observers.forEach((o) => o.disconnect());
    observers.length = 0;
  });

  return { animateOnScroll };
}
