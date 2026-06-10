import { useLayoutEffect, useRef, useState } from 'react';

export const useScrollAnimation = () => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        const element = elementRef.current;
        if (!element) {
            return;
        }

        // Never gate content behind the animation when the browser can't run it
        // or the user prefers reduced motion.
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return;
        }

        // Content already in the viewport on first paint (e.g. mid-page reload,
        // anchor links) must show immediately instead of waiting for a scroll.
        if (element.getBoundingClientRect().top < window.innerHeight) {
            setIsVisible(true);
            return;
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
                rootMargin: '0px 0px -50px 0px'
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, []);

    return { elementRef, isVisible };
};
