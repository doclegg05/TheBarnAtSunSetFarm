import { useLayoutEffect, useRef, useState } from 'react';

const shouldStartVisible = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    typeof IntersectionObserver === 'undefined');

export const useScrollAnimation = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(shouldStartVisible);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    if (isVisible) {
      return;
    }

    // Content already in the viewport on first paint (e.g. mid-page reload,
    // anchor links) must show immediately instead of waiting for a scroll.
    if (element.getBoundingClientRect().top < window.innerHeight) {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        // threshold 0 so very tall sections (taller than the viewport)
        // still trigger; the rootMargin keeps it from firing too early.
        threshold: 0,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [isVisible]);

  return { elementRef, isVisible };
};
