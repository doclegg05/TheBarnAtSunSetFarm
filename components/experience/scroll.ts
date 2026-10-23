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
  if (engine && immediate) {
    // Right after a page loads, Lenis may still hold the page height from
    // before the pins added their scroll room, and would stop short of the
    // target; measure again first.
    engine.resize();
    const top = window.scrollY + target.getBoundingClientRect().top;
    engine.scrollTo(top, { immediate: true, force: true });
  } else if (engine) {
    engine.scrollTo(target, { duration: 1.6 });
  } else {
    target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
  }
};
