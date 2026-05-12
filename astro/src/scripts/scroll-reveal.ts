import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Shared Astro-side scroll-reveal.
 *
 * Marks:
 *   - `data-reveal`            — fade + slide-up this element on scroll-in.
 *   - `data-reveal-stagger`    — on a container; its direct `[data-reveal]`
 *                                children are revealed together with a stagger.
 *
 * Respects `prefers-reduced-motion: reduce` (no-op — elements stay visible, so
 * no element is ever left at `opacity: 0`). Only `opacity` / `transform` are
 * animated → no layout shift. Initialises once globally (idempotent), so it is
 * safe to import from several component `<script>` blocks.
 */
let inited = false;

function reveal(): void {
  if (inited) return;
  inited = true;

  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const opts = { duration: 0.5, ease: 'power2.out' as const };

  // Staggered groups first, so their children aren't also picked up as singles.
  const claimed = new Set<Element>();
  document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((group) => {
    const children = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
      (c) => c.closest('[data-reveal-stagger]') === group,
    );
    if (children.length === 0) return;
    children.forEach((c) => claimed.add(c));
    gsap.fromTo(
      children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        ...opts,
        stagger: 0.09,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      },
    );
  });

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (claimed.has(el)) return;
    const y = el.dataset.revealY != null ? Number(el.dataset.revealY) : 24;
    gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        ...opts,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    );
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
