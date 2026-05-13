/**
 * Shared Astro-side scroll-reveal — IntersectionObserver + CSS transitions only.
 *
 * The previous implementation used GSAP's ScrollTrigger, which writes start-state
 * inline styles (`opacity: 0`, `transform`) and then immediately reads each
 * element's `getBoundingClientRect()` / `offsetTop` to register its trigger.
 * That write-then-read pattern forces a synchronous layout pass for every
 * `[data-reveal]` on the page (PageSpeed "Forced reflow" flagged ~163ms on the
 * home view). IntersectionObserver does its intersection work off the main
 * layout path, so the same fade/slide-up costs ~0ms of forced reflow — and the
 * GSAP/ScrollTrigger chunks no longer need to load on pages that only do
 * scroll-reveals.
 *
 * Marks (unchanged — call sites stay the same):
 *   - `data-reveal`            — fade + slide-up this element when it scrolls in.
 *   - `data-reveal-stagger`    — on a container; its direct `[data-reveal]`
 *                                children reveal together with a 90ms stagger.
 *
 * Start/end states are declared in CSS (src/styles/app.css → "Scroll-reveal");
 * this script only toggles the `.is-revealed` class. Under
 * `prefers-reduced-motion: reduce` (and when IO is unavailable) every element
 * is marked revealed straight away — there's never a stuck `opacity: 0`. A
 * `<noscript>` block in BaseLayout overrides the start-state when JS is off, so
 * JS-disabled visitors see everything too. Idempotent on multiple imports.
 */

const REVEALED_CLASS = 'is-revealed';
const STAGGER_MS = 90;
const IO_OPTS: IntersectionObserverInit = { rootMargin: '0px 0px -15% 0px' };

let inited = false;

function reveal(): void {
  if (inited) return;
  inited = true;

  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced-motion or no IO support → reveal everything immediately, no animation.
  if (reduced || typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.classList.add(REVEALED_CLASS);
    });
    return;
  }

  // Staggered groups are claimed first so their children aren't also picked up
  // as singles (matches the previous GSAP behaviour).
  const claimed = new Set<Element>();
  const groupObserver = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const group = entry.target as HTMLElement;
      const children = Array.from(
        group.querySelectorAll<HTMLElement>('[data-reveal]'),
      ).filter((c) => c.closest('[data-reveal-stagger]') === group);
      children.forEach((c, i) => {
        if (i > 0) c.style.transitionDelay = `${i * STAGGER_MS}ms`;
        c.classList.add(REVEALED_CLASS);
      });
      obs.unobserve(group);
    }
  }, IO_OPTS);

  document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((group) => {
    const children = Array.from(
      group.querySelectorAll<HTMLElement>('[data-reveal]'),
    ).filter((c) => c.closest('[data-reveal-stagger]') === group);
    if (children.length === 0) return;
    children.forEach((c) => claimed.add(c));
    groupObserver.observe(group);
  });

  // Singles — one shared observer for everything that isn't in a stagger group.
  const itemObserver = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      (entry.target as HTMLElement).classList.add(REVEALED_CLASS);
      obs.unobserve(entry.target);
    }
  }, IO_OPTS);

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (claimed.has(el)) return;
    itemObserver.observe(el);
  });
}

export function initScrollReveal(): void {
  if (typeof document === 'undefined') return;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reveal, { once: true });
  } else {
    reveal();
  }
}

// Auto-init on import — keeps the call-site `<script>` blocks to a one-liner.
initScrollReveal();
