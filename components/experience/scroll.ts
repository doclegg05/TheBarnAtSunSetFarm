import type Lenis from 'lenis';

/**
 * In-page jumps (nav links, buttons) go through here so they glide with the
 * smooth-scroll engine when it is running and fall back to the browser's
 * own smooth scrolling when it is not (reduced motion, tests).
 */
let engine: Lenis | null = null;

export const setScrollEngine = (next: Lenis | null) => {
  engine = next;
};

interface ScrollOptions {
  /** Jump straight there instead of gliding, e.g. on arriving at a page. */
  immediate?: boolean;
}

export const scrollToSection = (
  id: string,
  { immediate = false }: ScrollOptions = {}
) => {
  const target = document.getElementById(id);
  if (!target) return;
  if (engine) {
    // Lenis may still hold the page height from before the pins added their
    // scroll room, and would stop short of the target; measure again first.
    engine.resize();
    const lenis = engine;
    const jump = () => {
      const offset = target.getBoundingClientRect().top;
      if (Math.abs(offset) > 1) {
        lenis.scrollTo(window.scrollY + offset, {
          immediate: true,
          force: true,
        });
      }
    };
    if (immediate) {
      jump();
    } else {
      // A glide aims at where the section was when it started; anything that
      // shifts on the way (a pin, a re-split heading) is corrected at the end.
      lenis.scrollTo(target, { duration: 1.6, onComplete: jump });
    }
  } else {
    target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
  }
};
