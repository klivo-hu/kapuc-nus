'use client';

import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Picture } from '@/components/media/picture';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { HeroSlide } from '@/lib/content/types';
import { DURATION, EASE, HERO_INTERVAL, STAGGER } from '@/lib/design/motion';
import { INTRO_PENDING_CLASS, useIntroSettled } from '@/lib/motion/intro';
import { MOTION_QUERY, gsap, useGSAP } from '@/lib/motion/gsap';
import { typeset } from '@/lib/format/typeset';

export const HERO_IMAGE_SIZES = '(min-width: 1024px) 56vw, 100vw';
/** How long a slide change waits for the next image to decode before going ahead anyway. */
const DECODE_WAIT_MS = 1200;

type Slide = HeroSlide & { image: NonNullable<HeroSlide['image']> };

interface HeroCarouselProps {
  readonly slides: readonly Slide[];
  readonly directionsUrl: string;
}

/**
 * The home hero: an editorial split with the words on one side and a large photograph on the
 * other, rotating through the slides the café manages in the admin.
 *
 * One GSAP timeline per change: the outgoing lines lift away, the next photograph is uncovered
 * from below while it settles from a slight zoom, and the new lines rise in sequence. A second
 * tween is the clock — it fills the active progress bar and advances when it completes, so the
 * visible timer and the rotation can never disagree.
 *
 * The slides change on their own, slowly enough to read the words beside the photograph. The
 * rotation stops only when there is a reason: the visitor pressed pause, a keyboard user is on
 * one of the hero's controls, or the tab is in the background (it resumes when it returns). A
 * resting mouse does not stop it. With reduced motion the slides still change, as a crossfade.
 *
 * All slides are server-rendered in one grid cell, so the column is as tall as the longest text
 * and nothing moves when the text changes. Without JavaScript the first slide simply stays.
 */
export function HeroCarousel({ slides, directionsUrl }: HeroCarouselProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const introSettled = useIntroSettled();
  const introWasPending = useRef<boolean | null>(null);
  const activeRef = useRef(0);
  const busy = useRef(false);
  const clock = useRef<gsap.core.Tween | null>(null);
  const count = slides.length;

  const { contextSafe } = useGSAP({ scope: rootRef });

  const goTo = contextSafe((next: number, userInitiated: boolean) => {
    const root = rootRef.current;
    const from = activeRef.current;
    if (!root || busy.current || next === from) return;
    busy.current = true;
    if (userInitiated) setAnnounce(true);

    const texts = root.querySelectorAll<HTMLElement>('[data-slide-text]');
    const images = root.querySelectorAll<HTMLElement>('[data-slide-image]');
    const outText = texts[from];
    const inText = texts[next];
    const outImage = images[from];
    const inImage = images[next];
    if (!outText || !inText || !outImage || !inImage) {
      busy.current = false;
      return;
    }

    const run = () => {
      activeRef.current = next;
      setActive(next);
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set([outText, outImage], { autoAlpha: 0 });
          gsap.set(inImage, { zIndex: 1, clearProps: 'clipPath' });
          gsap.set(outImage, { zIndex: 0 });
          busy.current = false;
        },
      });

      if (calm) {
        // Reduced motion: a plain crossfade — no travel, no scale.
        tl.set(inImage, { zIndex: 2, autoAlpha: 0 })
          .to(inImage, { autoAlpha: 1, duration: 0.3 }, 0)
          .to(outText, { autoAlpha: 0, duration: 0.2 }, 0)
          .fromTo(inText, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.1);
        return;
      }

      const inLines = inText.querySelectorAll('[data-line]');
      tl.to(outText.querySelectorAll('[data-line]'), {
        y: -18,
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.in',
        stagger: STAGGER * 0.6,
      })
        .set(outText, { autoAlpha: 0 })
        .set(inImage, { zIndex: 2, autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' }, 0)
        .to(
          inImage,
          { clipPath: 'inset(0% 0% 0% 0%)', duration: DURATION.slow, ease: EASE.inOut },
          0.1,
        )
        .fromTo(
          inImage.querySelector('img'),
          { scale: 1.1 },
          { scale: 1, duration: DURATION.slow + 0.5, ease: EASE.out },
          0.1,
        )
        .set(inText, { autoAlpha: 1 }, 0.45)
        .fromTo(
          inLines,
          { y: 26, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: DURATION.base + 0.2,
            ease: EASE.outSoft,
            stagger: STAGGER,
          },
          0.5,
        );
    };

    // Never uncover a half-loaded photograph: wait for the next image to decode first.
    const img = inImage.querySelector('img');
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      run();
    };
    window.setTimeout(start, DECODE_WAIT_MS);
    if (img) img.decode().then(start, start);
    else start();
  });

  const next = useCallback(
    (user: boolean) => goTo((activeRef.current + 1) % count, user),
    [goTo, count],
  );
  const previous = useCallback(
    () => goTo((activeRef.current - 1 + count) % count, true),
    [goTo, count],
  );

  // The clock: restarts on every slide change; holds while paused, while a keyboard user is on the
  // hero's controls, and while the tab is hidden.
  const running = count > 1 && !paused && !keyboardFocus && !pageHidden && introSettled;
  useGSAP(
    () => {
      const bar = rootRef.current?.querySelector(`[data-progress="${active}"]`);
      if (!bar || count < 2) return;
      clock.current = gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: HERO_INTERVAL,
          ease: 'none',
          paused: true,
          onComplete: () => next(false),
        },
      );
    },
    { scope: rootRef, dependencies: [active, count], revertOnUpdate: true },
  );

  useEffect(() => {
    const tween = clock.current;
    if (!tween) return;
    if (running) tween.play();
    else tween.pause();
  }, [running, active]);

  // A hidden tab should not rotate through slides nobody sees; it picks up again on return.
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // The first entrance plays as the curtain lifts, continuing its motion. On a visit without the
  // curtain the hero is simply there — animating an already painted headline would only flicker.
  useGSAP(
    () => {
      if (introWasPending.current === null) {
        introWasPending.current = document.documentElement.classList.contains(INTRO_PENDING_CLASS);
      }
      if (!introSettled || !introWasPending.current) return;
      const media = gsap.matchMedia();
      media.add(MOTION_QUERY, () => {
        gsap.from('[data-slide-text="0"] [data-line], [data-hero-actions] > *', {
          y: 24,
          autoAlpha: 0,
          duration: DURATION.base + 0.3,
          ease: EASE.outSoft,
          stagger: STAGGER,
          delay: 0.1,
        });
        gsap.from('[data-slide-image="0"] img', {
          scale: 1.06,
          duration: DURATION.slow + 0.8,
          ease: EASE.out,
        });
      });
      return () => media.revert();
    },
    { scope: rootRef, dependencies: [introSettled] },
  );

  return (
    <section
      ref={rootRef}
      aria-roledescription="karusszel"
      aria-label="Kiemelt ajánlataink"
      // Only keyboard focus holds the rotation: a mouse click on a control leaves it running.
      onFocusCapture={(event) => setKeyboardFocus(event.target.matches(':focus-visible'))}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setKeyboardFocus(false);
        }
      }}
      className="shell grid min-h-[100svh] grid-cols-1 content-start gap-8 pb-10 pt-[calc(var(--cef-space-nav)+var(--cef-space-nav-offset)*2+1rem)] lg:grid-cols-12 lg:content-stretch lg:gap-10 lg:pb-[clamp(2rem,4vh,3.5rem)] lg:pt-[calc(var(--cef-space-nav)+var(--cef-space-nav-offset)*2+1.5rem)]"
    >
      {/* Photograph — first on small screens, right on large ones. */}
      <div className="relative order-1 h-[min(52svh,30rem)] overflow-hidden rounded-xl sm:h-[min(60svh,38rem)] lg:order-2 lg:col-span-7 lg:h-auto lg:min-h-[34rem] lg:rounded-2xl">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            data-slide-image={index}
            className={cn('absolute inset-0', index === 0 ? 'z-[1]' : 'invisible z-0')}
            aria-hidden={index !== active}
          >
            <Picture
              image={slide.image}
              alt={slide.imageAlt || slide.title}
              sizes={HERO_IMAGE_SIZES}
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Words */}
      <div className="order-2 flex flex-col lg:order-1 lg:col-span-5 lg:justify-end lg:pb-2">
        <div className="grid" aria-live={announce && !running ? 'polite' : 'off'}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              data-slide-text={index}
              role="group"
              aria-roledescription="dia"
              aria-label={`${index + 1} / ${count}`}
              aria-hidden={index !== active}
              inert={index !== active}
              className={cn('col-start-1 row-start-1', index !== 0 && 'invisible')}
            >
              <h2 data-line className="font-serif text-display text-foreground">
                {typeset(slide.title)}
              </h2>
              {slide.description ? (
                <p data-line className="mt-6 max-w-[36ch] text-lead text-muted">
                  {typeset(slide.description)}
                </p>
              ) : null}
              {slide.note ? (
                <p
                  data-line
                  aria-hidden
                  className="mt-3 -rotate-3 pl-1 font-script text-script text-mocha-700"
                >
                  {typeset(slide.note)}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div data-hero-actions className="mt-9 flex flex-col gap-3 xs:flex-row">
          <ButtonLink href="/etlap" size="lg" icon={<ArrowRight className="size-4" />}>
            Étlap és itallap
          </ButtonLink>
          <ButtonLink href={directionsUrl} external variant="secondary" size="lg">
            Útvonaltervezés
          </ButtonLink>
        </div>

        {count > 1 ? (
          <div className="mt-10 flex items-center gap-5 lg:mt-14">
            <div className="flex flex-1 gap-2" aria-hidden>
              {slides.map((slide, index) => (
                <span
                  key={slide.id}
                  className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-mocha-700/15"
                >
                  <span
                    data-progress={index}
                    className={cn(
                      'absolute inset-0 origin-left bg-mocha-700',
                      index < active ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </span>
              ))}
            </div>
            <p className="tabular text-meta text-muted" aria-hidden>
              {active + 1} / {count}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={previous}
                className="flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-cream-200"
              >
                <ChevronLeft aria-hidden className="size-5" />
                <span className="sr-only">Előző dia</span>
              </button>
              <button
                type="button"
                onClick={() => setPaused((current) => !current)}
                className="flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-cream-200"
              >
                {paused ? (
                  <Play aria-hidden className="size-[1.1rem]" />
                ) : (
                  <Pause aria-hidden className="size-[1.1rem]" />
                )}
                <span className="sr-only">
                  {paused ? 'Automatikus lapozás indítása' : 'Automatikus lapozás szüneteltetése'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => next(true)}
                className="flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-cream-200"
              >
                <ChevronRight aria-hidden className="size-5" />
                <span className="sr-only">Következő dia</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
