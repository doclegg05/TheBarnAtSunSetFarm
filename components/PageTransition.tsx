import React from 'react';
import { Link, useNavigate, type LinkProps } from 'react-router-dom';

/**
 * A sunset-coloured curtain that sweeps across the screen between pages:
 * it rises to cover the old page, the route changes underneath it, and it
 * lifts away to reveal the new one. Plain CSS, so the classic pages carry
 * no animation library. Visitors who prefer reduced motion skip it.
 */

type Phase = 'idle' | 'cover' | 'reveal';

const COVER_MS = 650;
const REVEAL_MS = 750;

const TransitionContext = React.createContext<((to: string) => void) | null>(
  null
);

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export const PageTransitionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = React.useState<Phase>('idle');
  const timers = React.useRef<number[]>([]);

  React.useEffect(
    () => () => {
      for (const timer of timers.current) window.clearTimeout(timer);
    },
    []
  );

  const go = React.useCallback(
    (to: string) => {
      if (phase !== 'idle') return;
      if (prefersReducedMotion()) {
        navigate(to);
        window.scrollTo(0, 0);
        return;
      }
      setPhase('cover');
      timers.current.push(
        window.setTimeout(() => {
          navigate(to);
          window.scrollTo(0, 0);
          setPhase('reveal');
          timers.current.push(
            window.setTimeout(() => setPhase('idle'), REVEAL_MS)
          );
        }, COVER_MS)
      );
    },
    [navigate, phase]
  );

  return (
    <TransitionContext.Provider value={go}>
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-100 flex items-center justify-center"
        style={{
          visibility: phase === 'idle' ? 'hidden' : 'visible',
          background:
            'linear-gradient(to bottom, #262640, #8a4f5f 45%, #efb894 80%, #f6dcae)',
          transform:
            phase === 'cover'
              ? 'translateY(0)'
              : phase === 'reveal'
                ? 'translateY(-100%)'
                : 'translateY(100%)',
          transition:
            phase === 'idle'
              ? 'none'
              : `transform ${phase === 'cover' ? COVER_MS : REVEAL_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
        }}
      >
        <span
          className="font-serif text-3xl italic text-white/90 sm:text-5xl"
          style={{
            opacity: phase === 'cover' ? 1 : 0,
            transition: 'opacity 400ms ease',
          }}
        >
          The Barn at Sunset Farm
        </span>
      </div>
    </TransitionContext.Provider>
  );
};

/** A router link that plays the curtain when a transition provider is present. */
export const TransitionLink: React.FC<LinkProps & { to: string }> = ({
  to,
  onClick,
  ...props
}) => {
  const go = React.useContext(TransitionContext);
  return (
    <Link
      to={to}
      onClick={(event) => {
        onClick?.(event);
        if (
          !go ||
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        go(to);
      }}
      {...props}
    />
  );
};
