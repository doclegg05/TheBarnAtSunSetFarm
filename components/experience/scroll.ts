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

export const scrollToSection = (id: string) => {
  const target = document.getElementById(id);
  if (!target) return;
  if (engine) {
    engine.scrollTo(target, { duration: 1.6 });
  } else {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};
