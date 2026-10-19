import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { DescentPlayer } from './descent';
import { setScrollEngine } from './scroll';

/**
 * Every scroll and pointer animation on the /experience page. The markup in
 * sections.tsx is complete without it; this only adds motion, and only when
 * the visitor has not asked their system for reduced motion.
 *
 * Returns a cleanup that reverts every tween, pin and listener.
 */
export const initMotion = (root: HTMLElement): (() => void) => {
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
      // Lenis eases wheel and keyboard scrolling; touch keeps its native
      // feel. GSAP's ticker drives it so pins and scrubs stay in lockstep.
      const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
      lenis.on('scroll', ScrollTrigger.update);
      const drive = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(drive);
      gsap.ticker.lagSmoothing(0);
      setScrollEngine(lenis);
      cleanups.push(() => {
        setScrollEngine(null);
        gsap.ticker.remove(drive);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      });

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

      /* ---------------- Descent: from the sky to the barn doors ---------------- */
      const descent = all('.xp-descent')[0];
      const canvas = all<HTMLCanvasElement>('.xp-descent-canvas')[0];
      if (descent && canvas) {
        const player = new DescentPlayer(canvas);
        const onResize = () => player.resize();
        window.addEventListener('resize', onResize);
        cleanups.push(() => {
          window.removeEventListener('resize', onResize);
          player.dispose();
        });

        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: descent,
              start: 'top top',
              end: '+=360%',
              pin: true,
              scrub: true,
              onUpdate: (self) => player.setProgress(self.progress),
            },
          })
          .to('.xp-descent-hint', { autoAlpha: 0, duration: 0.04 }, 0)
          .to(
            '.xp-descent-intro',
            { autoAlpha: 0, y: -80, duration: 0.12, ease: 'power1.in' },
            0.03
          )
          .fromTo(
            '.xp-descent-arrive',
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' },
            0.78
          )
          .fromTo(
            '.xp-descent-fade',
            { opacity: 0 },
            { opacity: 1, duration: 0.1 },
            0.9
          )
          // Keeps the timeline exactly one unit long, so its progress and
          // the frame progress agree.
          .set({}, {}, 1);

        gsap.from('.xp-descent-intro > *', {
          y: 40,
          autoAlpha: 0,
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
      }

      /* ---------------- Hero: the arched window opens ---------------- */
      const hero = all('.xp-hero')[0];
      const frame = all('.xp-hero-frame')[0];
      const title = all('.xp-hero-title')[0];
      if (hero && frame && title) {
        const archHeight = () => Math.min(window.innerHeight * 0.56, 640);
        const archWidth = () =>
          Math.min(archHeight() * 0.66, window.innerWidth * 0.78);
        const lineShift = () => {
          const size = parseFloat(getComputedStyle(title).fontSize) || 80;
          return archHeight() / 2 - size * 0.18;
        };

        const scroll = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '+=140%',
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        scroll
          .fromTo(
            frame,
            {
              width: archWidth,
              height: archHeight,
              borderRadius: () =>
                `${archWidth() / 2}px ${archWidth() / 2}px 24px 24px`,
            },
            {
              width: () => hero.clientWidth,
              height: () => hero.clientHeight,
              borderRadius: '0px 0px 0px 0px',
              ease: 'power2.inOut',
              duration: 1,
            },
            0
          )
          .fromTo('.xp-hero-img', { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
          .fromTo(
            '.xp-hero-line1',
            { y: () => -lineShift() },
            { y: 0, duration: 0.7, ease: 'power2.inOut' },
            0
          )
          .fromTo(
            '.xp-hero-line2',
            { y: () => lineShift() },
            { y: 0, duration: 0.7, ease: 'power2.inOut' },
            0
          )
          .fromTo(title, { '--lit': 0 }, { '--lit': 1, duration: 0.4 }, 0.35)
          .fromTo(
            '.xp-hero-shade',
            { opacity: 0 },
            { opacity: 1, duration: 0.5 },
            0.35
          )
          .to('.xp-scroll-hint', { autoAlpha: 0, duration: 0.1 }, 0)
          .fromTo(
            '.xp-hero-copy',
            { autoAlpha: 0, y: 50 },
            { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' },
            0.7
          );

        // The entrance as the hero arrives below the descent: letters rise,
        // the window wipes open.
        const intro = gsap.timeline({
          defaults: { ease: 'expo.out' },
          scrollTrigger: { trigger: hero, start: 'top 70%', once: true },
        });
        intro
          .from('.xp-hero .xp-letter', {
            yPercent: 115,
            duration: 1.5,
            stagger: 0.04,
          })
          .fromTo(
            frame,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.8,
              ease: 'expo.inOut',
              clearProps: 'clipPath',
            },
            0.15
          )
          .to('.xp-scroll-hint', { opacity: 0.75, duration: 1 }, 1.4);
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

      /* ---------------- Statement: words light up ---------------- */
      const words = all('.xp-words')[0];
      if (words) {
        gsap.fromTo(
          all('.xp-word'),
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: {
              trigger: words,
              start: 'top 80%',
              end: 'bottom 40%',
              scrub: true,
            },
          }
        );
      }
      for (const photo of all('.xp-float')) {
        const speed = Number(photo.dataset.speed) || -20;
        gsap.fromTo(
          photo,
          { yPercent: -speed, rotation: '-=4' },
          {
            yPercent: speed,
            rotation: '+=8',
            ease: 'none',
            scrollTrigger: {
              trigger: photo.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
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
        if (finePointer && range) {
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

      /* ---------------- The barn ---------------- */
      for (const clip of all('.xp-clip')) {
        gsap.fromTo(
          clip,
          { clipPath: 'inset(14% 12% 14% 12% round 32px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 32px)',
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

      /* ---------------- Contact card rises ---------------- */
      for (const card of all('.xp-contact')) {
        gsap.fromTo(
          card,
          { scale: 0.86, y: 90, borderRadius: '64px' },
          {
            scale: 1,
            y: 0,
            borderRadius: '32px',
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 98%',
              end: 'top 35%',
              scrub: 1,
            },
          }
        );
      }

      /* ---------------- Finale ---------------- */
      const finale = all('.xp-finale')[0];
      if (finale) {
        gsap.from(all('.xp-finale-letters .xp-letter'), {
          yPercent: 115,
          duration: 1.3,
          stagger: 0.035,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: finale,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        });
        for (const ridge of all<SVGElement>('.xp-ridge')) {
          const depth = Number(ridge.dataset.depth) || 0.2;
          gsap.fromTo(
            ridge,
            { y: depth * 320 },
            {
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: finale,
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: true,
              },
            }
          );
        }
        gsap.to(all<SVGElement>('.xp-window'), {
          opacity: 0.7,
          duration: 1.8,
          stagger: { each: 0.6, repeat: -1, yoyo: true },
          ease: 'sine.inOut',
        });
        gsap.to(all<SVGElement>('.xp-glow'), {
          scale: 1.25,
          transformOrigin: '50% 50%',
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
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
