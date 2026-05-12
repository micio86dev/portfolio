import { onBeforeUnmount } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type GsapVars = Record<string, unknown>;

interface AnimateOpts extends GsapVars {
  /** stagger seconds when `el` is a list / NodeList */
  stagger?: number;
}

const REDUCED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Target = Element | Element[] | NodeListOf<Element> | null | undefined;

/**
 * Reusable scroll-reveal helper for Vue islands.
 *
 * Returns `animateOnScroll(el, fromVars, toVars, opts?)`. When
 * `prefers-reduced-motion: reduce` is set it is a no-op — elements stay in
 * their natural (fully visible) state, so there is never a stuck `opacity: 0`.
 * Only `opacity` / `transform` are animated, so there is no layout shift.
 */
export function useScrollAnimation() {
  const triggers: ScrollTrigger[] = [];

  function animateOnScroll(
    el: Target,
    fromVars: GsapVars = { opacity: 0, y: 30 },
    toVars: GsapVars = { opacity: 1, y: 0 },
    opts: AnimateOpts = {},
  ): void {
    if (REDUCED || !el) return;
    const targets =
      el instanceof Element ? [el] : Array.from(el as ArrayLike<Element>);
    if (targets.length === 0) return;

    const { stagger, ...extra } = opts;
    const tween = gsap.fromTo(targets, { ...fromVars }, {
      ...toVars,
      duration: 0.5,
      ease: 'power2.out',
      ...(stagger != null ? { stagger } : {}),
      scrollTrigger: {
        trigger: targets[0],
        start: 'top 85%',
        once: true,
      },
      ...extra,
    });
    const st = tween.scrollTrigger;
    if (st) triggers.push(st);
  }

  onBeforeUnmount(() => {
    triggers.forEach((t) => t.kill());
    triggers.length = 0;
  });

  return { animateOnScroll };
}
