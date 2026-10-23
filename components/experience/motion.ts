import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { CAPTIONS } from './descentSpots';
import { FilmPlayer } from './film';
import descentFilm from './films/descent';
import insideFilm from './films/inside';
import { scrollToSection, setScrollEngine } from './scroll';

/** How many screens of scrolling each pinned film plays over. */
const DESCENT_SCREENS = 2.6;
const INSIDE_SCREENS = 1.2;
/**
 * The descent plays over this share of its pin, then holds on the barn while
 * the welcome and the pins come in, so the last frame can be explored.
 */
const DESCENT_FILM_END = 0.82;

/**
 * Every scroll and pointer animation on the /experience page. The markup in
 * sections.tsx is complete without it; this only adds motion, and only when
 * the visitor has not asked their system for reduced motion.
 *
 * Returns a cleanup that reverts every tween, pin and listener.
 */

/**
 * Lands on a section the visitor arrived for (a #section in the URL). Fonts
 * and photos that finish later make ScrollTrigger re-measure, which moves
 * every section below a pin, so this lands again after each re-measure until
 * the visitor scrolls on their own. Returns a cleanup.
 */
const landOnSection = (id: string): (() => void) => {
  const land = () => scrollToSection(id, { immediate: true });
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  const stop = () => {
    ScrollTrigger.removeEventListener('refresh', land);
    for (const event of events) window.removeEventListener(event, stop);
  };
  ScrollTrigger.addEventListener('refresh', land);
  for (const event of events) {
    window.addEventListener(event, stop, { passive: true });
  }
  land();
  return stop;
};

/**
 * Lenis eases wheel and keyboard scrolling. It listens to touch with
 * passive: false, which makes iOS Safari wait for script before every scroll
 * step, so the whole page jerks whenever the page is busy; that is why it
 * only starts with a mouse or trackpad. GSAP's ticker drives it so pins and
 * scrubs stay in lockstep.
 */
const startSmoothScroll = (): { lenis: Lenis; stop: () => void } => {
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  const drive = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(drive);
  gsap.ticker.lagSmoothing(0);
  setScrollEngine(lenis);
  const stop = () => {
    setScrollEngine(null);
    gsap.ticker.remove(drive);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
  return { lenis, stop };
};

interface MotionOptions {
  /** A section to land on once the page has measured itself. */
  landOn?: string;
}

export const initMotion = (
  root: HTMLElement,
  { landOn }: MotionOptions = {}
): (() => void) => {
  // Registered here, not at import, so the module loads outside a browser.
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia(root);
  const q = gsap.utils.selector(root);
  const all = <T extends Element = HTMLElement>(selector: string) =>
    q(selector) as unknown as T[];

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      wide: '(min-width: 768px)',
      finePointer: '(hover: hover) and (pointer: fine)',
    },
    (context) => {
      const { motion, finePointer } = context.conditions ?? {};
      if (!motion) return;
      const cleanups: Array<() => void> = [];

      /* ---------------- Smooth, weighted scrolling ---------------- */
      // Only with a mouse or trackpad: touch screens keep native scrolling.
      const smooth = finePointer ? startSmoothScroll() : null;
      if (smooth) cleanups.push(smooth.stop);
      const lenis = smooth?.lenis ?? null;

      /* ---------------- Headings rise line by line ---------------- */
      for (const heading of all('.xp-split')) {
        const split = SplitText.create(heading, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              rotation: 2,
              duration: 1.3,
              stagger: 0.12,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: heading,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            }),
        });
        cleanups.push(() => split.revert());
      }

      /* ---------------- Scroll films: the descent and the walk inside ---------------- */
      // A film loads once its section is within two and a half screens and
      // lets its frames go once the visitor is that far past it.
      const film = (
        section: HTMLElement,
        canvas: HTMLCanvasElement,
        frames: typeof descentFilm | typeof insideFilm,
        pinScreens: number
      ) => {
        const player = new FilmPlayer(canvas, frames);
        const onResize = () => player.resize();
        window.addEventListener('resize', onResize);
        cleanups.push(() => {
          window.removeEventListener('resize', onResize);
          player.dispose();
        });
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom+=150%',
          end: () => `+=${window.innerHeight * (pinScreens + 5)}`,
          onToggle: (self) =>
            self.isActive ? player.load() : player.release(),
        });
        return player;
      };

      /* ---------------- Descent: from the sky to the barn doors ---------------- */
      const descent = all('.xp-descent')[0];
      const canvas = all<HTMLCanvasElement>('.xp-descent-canvas')[0];
      if (descent && canvas) {
        const player = film(descent, canvas, descentFilm, DESCENT_SCREENS);

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: descent,
            start: 'top top',
            end: () => `+=${window.innerHeight * DESCENT_SCREENS}`,
            pin: true,
            scrub: true,
            onUpdate: (self) =>
              player.setProgress(self.progress / DESCENT_FILM_END),
          },
        });
        timeline
          .to('.xp-descent-hint', { autoAlpha: 0, duration: 0.04 }, 0)
          .to(
            '.xp-descent-intro',
            { autoAlpha: 0, y: -80, duration: 0.1, ease: 'power1.in' },
            0.03
          );
        // Each caption rises in and leaves at its stretch of the film.
        all('.xp-descent-caption').forEach((caption, index) => {
          const { from, to } = CAPTIONS[index];
          const start = from * DESCENT_FILM_END;
          const end = to * DESCENT_FILM_END;
          timeline
            .fromTo(
              caption,
              { autoAlpha: 0, y: 24 },
              { autoAlpha: 1, y: 0, duration: 0.04 },
              start
            )
            .to(caption, { autoAlpha: 0, y: -16, duration: 0.04 }, end - 0.04);
        });
        timeline
          .fromTo(
            '.xp-descent-arrive',
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' },
            DESCENT_FILM_END
          )
          .fromTo(
            '.xp-descent-pins, .xp-descent-chips',
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.06 },
            DESCENT_FILM_END + 0.05
          )
          .fromTo(
            '.xp-descent-fade',
            { opacity: 0 },
            { opacity: 1, duration: 0.04 },
            0.96
          )
          // Keeps the timeline exactly one unit long, so its progress and
          // the pin's progress agree.
          .set({}, {}, 1);

        // Opacity, not autoAlpha: the page heading stays visible to screen
        // readers and never waits on the animation to be readable.
        gsap.from('.xp-descent-intro > *', {
          y: 40,
          opacity: 0,
          duration: 1.6,
          stagger: 0.15,
          ease: 'expo.out',
          delay: 0.2,
        });
        gsap.to('.xp-descent-hint', {
          opacity: 0.85,
          duration: 1,
          delay: 1.2,
        });
        gsap.fromTo(
          '.xp-scroll-hint-dot',
          { yPercent: -100 },
          { yPercent: 340, duration: 1.6, ease: 'power1.inOut', repeat: -1 }
        );
      }

      /* ---------------- Generic rise-in reveals ---------------- */
      for (const element of all('.xp-reveal')) {
        gsap.from(element, {
          y: 60,
          autoAlpha: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      /* ---------------- The day: a horizontal track ---------------- */
      const day = all('.xp-day')[0];
      const track = all('.xp-day-track')[0];
      if (day && track) {
        const distance = () =>
          Math.max(0, track.scrollWidth - window.innerWidth);
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: day,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        gsap.fromTo(
          '.xp-day-fill',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: day,
              start: 'top top',
              end: () => `+=${distance()}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
        // Desktop visitors can also grab the track and fling it sideways.
        const range = slide.scrollTrigger;
        if (lenis && range) {
          let dragging = false;
          let moved = false;
          let startX = 0;
          let startScroll = 0;
          let lastX = 0;
          let lastTime = 0;
          let velocity = 0;
          const clampToTrack = (value: number) =>
            Math.min(range.end, Math.max(range.start, value));
          const down = (event: PointerEvent) => {
            if (event.button !== 0) return;
            dragging = true;
            moved = false;
            startX = lastX = event.clientX;
            lastTime = performance.now();
            startScroll = lenis.scroll;
            velocity = 0;
            day.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
          };
          const move = (event: PointerEvent) => {
            if (!dragging) return;
            const dx = event.clientX - startX;
            if (Math.abs(dx) > 4) moved = true;
            const now = performance.now();
            velocity = (event.clientX - lastX) / Math.max(1, now - lastTime);
            lastX = event.clientX;
            lastTime = now;
            lenis.scrollTo(clampToTrack(startScroll - dx * 1.4), {
              immediate: true,
            });
          };
          const up = () => {
            if (!dragging) return;
            dragging = false;
            day.style.cursor = '';
            document.body.style.userSelect = '';
            lenis.scrollTo(clampToTrack(lenis.scroll - velocity * 450), {
              duration: 1.3,
            });
          };
          // A drag is not a click on whatever it started over.
          const click = (event: MouseEvent) => {
            if (!moved) return;
            event.preventDefault();
            event.stopPropagation();
            moved = false;
          };
          const noGhost = (event: DragEvent) => event.preventDefault();
          day.addEventListener('pointerdown', down);
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', up);
          day.addEventListener('click', click, true);
          day.addEventListener('dragstart', noGhost);
          day.style.cursor = 'grab';
          cleanups.push(() => {
            day.removeEventListener('pointerdown', down);
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            day.removeEventListener('click', click, true);
            day.removeEventListener('dragstart', noGhost);
            day.style.cursor = '';
          });
        }

        for (const photo of all('.xp-chapter-photo')) {
          const depth = Number(photo.dataset.depth) || 1;
          gsap.fromTo(
            photo,
            { xPercent: depth * 14 },
            {
              xPercent: -depth * 14,
              ease: 'none',
              scrollTrigger: {
                trigger: photo.closest('.xp-chapter'),
                containerAnimation: slide,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            }
          );
        }
        for (const chapter of all('.xp-chapter')) {
          gsap.from(chapter.querySelectorAll('h3, p'), {
            x: 80,
            autoAlpha: 0,
            stagger: 0.08,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: chapter,
              containerAnimation: slide,
              start: 'left 75%',
              toggleActions: 'play none none reverse',
            },
          });
        }
      }

      /* ---------------- Inside: the cedar doors open onto the hall ---------------- */
      const insideSection = all('.xp-inside')[0];
      const insideCanvas = all<HTMLCanvasElement>('.xp-inside-canvas')[0];
      if (insideSection && insideCanvas) {
        const player = film(
          insideSection,
          insideCanvas,
          insideFilm,
          INSIDE_SCREENS
        );
        const [doors, hall, porch] = all('.xp-inside-line');
        const rise = { autoAlpha: 1, y: 0, duration: 0.07, ease: 'power2.out' };
        const fall = {
          autoAlpha: 0,
          y: -30,
          duration: 0.07,
          ease: 'power1.in',
        };

        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: insideSection,
              start: 'top top',
              end: () => `+=${window.innerHeight * INSIDE_SCREENS}`,
              pin: true,
              scrub: true,
              onUpdate: (self) => player.setProgress(self.progress),
            },
          })
          // Timed to the film: the doors open over its first 40%, the hall
          // fills the middle, and it turns to the French doors at the end.
          .to(doors, fall, 0.26)
          .fromTo(hall, { autoAlpha: 0, y: 30 }, rise, 0.45)
          .to(hall, fall, 0.72)
          .fromTo(porch, { autoAlpha: 0, y: 30 }, rise, 0.86)
          .set({}, {}, 1);
      }

      /* ---------------- The barn ---------------- */
      for (const clip of all('.xp-clip')) {
        // A scale, not a clip-path: transforms are composited, so the photo
        // is not repainted on every scroll step.
        gsap.fromTo(
          clip,
          { scale: 0.8 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: clip,
              start: 'top 90%',
              end: 'center 55%',
              scrub: true,
            },
          }
        );
        const image = clip.querySelector('.xp-parallax-img');
        if (image) {
          gsap.fromTo(
            image,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: clip,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }
      }
      for (const counter of all('.xp-count')) {
        const target = Number(counter.dataset.to) || 0;
        const value = { n: 0 };
        counter.textContent = '0';
        gsap.to(value, {
          n: target,
          duration: 2.2,
          ease: 'power3.out',
          onUpdate: () => {
            counter.textContent = String(Math.round(value.n));
          },
          scrollTrigger: { trigger: counter, start: 'top 88%' },
        });
        cleanups.push(() => {
          counter.textContent = String(target);
        });
      }
      ScrollTrigger.batch(all('.xp-tile'), {
        start: 'top 92%',
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { autoAlpha: 0, y: 90, scale: 0.88 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              stagger: 0.12,
              duration: 1.3,
              ease: 'expo.out',
              overwrite: true,
            }
          ),
      });
      gsap.set(all('.xp-tile'), { autoAlpha: 0 });

      /* ---------------- Amenity marquees ---------------- */
      const rows = all('.xp-marquee').map((element) => ({
        element,
        direction: Number(element.dataset.direction) || 1,
        x: 0,
      }));
      if (rows.length > 0) {
        let boost = 0;
        let heading = 1;
        let visible = false;
        ScrollTrigger.create({
          trigger: rows[0].element.closest('section'),
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            visible = self.isActive;
          },
          onUpdate: (self) => {
            boost = Math.min(Math.abs(self.getVelocity()) / 250, 10);
            heading = self.direction;
          },
        });
        const tick = (_time: number, delta: number) => {
          boost *= 0.94;
          if (!visible) return;
          for (const row of rows) {
            const first = row.element.firstElementChild as HTMLElement | null;
            const loop = first ? first.offsetWidth + 16 : 0;
            if (loop === 0) continue;
            row.x += row.direction * heading * (0.035 + boost * 0.05) * delta;
            if (row.x <= -loop) row.x += loop;
            if (row.x > 0) row.x -= loop;
            gsap.set(row.element, { x: row.x });
          }
        };
        gsap.ticker.add(tick);
        cleanups.push(() => gsap.ticker.remove(tick));
      }

      /* ---------------- Lodging cards stack ---------------- */
      const cards = all('.xp-stack');
      cards.forEach((card, index) => {
        gsap.from(card, {
          y: 120,
          rotationX: -8,
          transformPerspective: 1200,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 95%',
            toggleActions: 'play none none reverse',
          },
        });
        const next = cards[index + 1];
        if (!next) return;
        gsap.fromTo(
          card,
          { scale: 1, filter: 'brightness(1)' },
          {
            scale: 0.9,
            filter: 'brightness(0.72)',
            ease: 'none',
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: 'top 20%',
              scrub: true,
            },
          }
        );
      });

      /* ---------------- Packages swing in ---------------- */
      for (const card of all('.xp-package')) {
        const side = Number(card.dataset.side) || 1;
        gsap.fromTo(
          card,
          {
            x: side * 140,
            rotationY: side * -32,
            rotationZ: side * 3,
            autoAlpha: 0,
          },
          {
            x: 0,
            rotationY: 0,
            rotationZ: 0,
            autoAlpha: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 95%',
              end: 'top 45%',
              scrub: 1,
            },
          }
        );
      }

      /* ---------------- Planning medallion ---------------- */
      const medallion = all('.xp-medallion')[0];
      if (medallion) {
        gsap.fromTo(
          medallion,
          { scale: 0.6, autoAlpha: 0, rotation: -20 },
          {
            scale: 1,
            autoAlpha: 1,
            rotation: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: medallion,
              start: 'top 95%',
              end: 'center 60%',
              scrub: 1,
            },
          }
        );
        gsap.to('.xp-medallion-ring', {
          rotation: 240,
          ease: 'none',
          transformOrigin: '50% 50%',
          scrollTrigger: {
            trigger: medallion,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
      ScrollTrigger.batch(all('.xp-list-item'), {
        start: 'top 92%',
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { autoAlpha: 0, x: -24 },
            {
              autoAlpha: 1,
              x: 0,
              stagger: 0.07,
              duration: 0.9,
              ease: 'expo.out',
              overwrite: true,
            }
          ),
      });
      gsap.set(all('.xp-list-item'), { autoAlpha: 0 });

      /* ---------------- Region: zoom into the gorge ---------------- */
      const region = all('.xp-region')[0];
      if (region) {
        const zoom = gsap.timeline({
          scrollTrigger: {
            trigger: region,
            start: 'top top',
            end: '+=180%',
            pin: true,
            scrub: 1,
          },
        });
        for (const item of all('.xp-region-item')) {
          zoom.fromTo(
            item,
            { scale: 1 },
            {
              scale: Number(item.dataset.scale) || 4,
              ease: 'power2.in',
              duration: 1,
            },
            0
          );
        }
        // Captions would balloon with the zoom; let them go first.
        zoom.to(
          '.xp-region-item figcaption',
          { autoAlpha: 0, duration: 0.15 },
          0
        );
        zoom.fromTo(
          '.xp-region-copy',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25 },
          0.78
        );
      }

      /* ---------------- Pointer: tilt and magnetism ---------------- */
      if (finePointer) {
        for (const card of all('.xp-tilt')) {
          const rotateX = gsap.quickTo(card, 'rotationX', {
            duration: 0.6,
            ease: 'power3',
          });
          const rotateY = gsap.quickTo(card, 'rotationY', {
            duration: 0.6,
            ease: 'power3',
          });
          gsap.set(card, { transformPerspective: 1000 });
          const move = (event: PointerEvent) => {
            const box = card.getBoundingClientRect();
            const px = (event.clientX - box.left) / box.width - 0.5;
            const py = (event.clientY - box.top) / box.height - 0.5;
            rotateY(px * 10);
            rotateX(-py * 10);
          };
          const leave = () => {
            rotateX(0);
            rotateY(0);
          };
          card.addEventListener('pointermove', move);
          card.addEventListener('pointerleave', leave);
          cleanups.push(() => {
            card.removeEventListener('pointermove', move);
            card.removeEventListener('pointerleave', leave);
          });
        }
        for (const button of all('.xp-magnetic')) {
          const moveX = gsap.quickTo(button, 'x', {
            duration: 0.5,
            ease: 'power3',
          });
          const moveY = gsap.quickTo(button, 'y', {
            duration: 0.5,
            ease: 'power3',
          });
          const move = (event: PointerEvent) => {
            const box = button.getBoundingClientRect();
            moveX((event.clientX - (box.left + box.width / 2)) * 0.3);
            moveY((event.clientY - (box.top + box.height / 2)) * 0.4);
          };
          const leave = () => {
            moveX(0);
            moveY(0);
          };
          button.addEventListener('pointermove', move);
          button.addEventListener('pointerleave', leave);
          cleanups.push(() => {
            button.removeEventListener('pointermove', move);
            button.removeEventListener('pointerleave', leave);
          });
        }
      }

      // Triggers were created feature by feature, not top to bottom; sort
      // them by page position so pins push later triggers correctly.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      if (landOn) cleanups.push(landOnSection(landOn));

      return () => {
        for (const cleanup of cleanups) cleanup();
      };
    }
  );

  // Late-loading fonts and photos change heights; re-measure once they land.
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', refresh);
  document.fonts?.ready.then(refresh).catch(() => undefined);

  return () => {
    window.removeEventListener('load', refresh);
    mm.revert();
  };
};
