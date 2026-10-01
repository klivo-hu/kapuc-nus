'use client';

import { useRef } from 'react';
import { DURATION, EASE } from '@/lib/design/motion';
import { INTRO_PENDING_CLASS, settleIntro } from '@/lib/motion/intro';
import { MOTION_QUERY, REDUCED_QUERY, gsap, useGSAP } from '@/lib/motion/gsap';
import { CoffeeEdge } from './coffee-edge';

/** Longest we wait for the latte art to decode before starting anyway. */
const IMAGE_WAIT_MS = 700;
/** Where the curtain begins to lift, in seconds from the start of the timeline. */
const LIFT_AT = 1.45;

/**
 * The first-visit curtain: a latte, the wordmark, and then the café itself.
 *
 * It is decorative (hidden from assistive technology) and never blocks: it plays once per
 * session, not at all when reduced motion is requested (the head script never marks it pending,
 * and the reduced branch below removes it if the preference arrives later),
 * any click or key press skips to the lift, and a CSS failsafe removes it after four seconds if
 * this script never runs. The page is visible and usable the moment the curtain starts to rise.
 */
export function IntroCurtain({ logoSrc }: { readonly logoSrc: string }) {
  const curtainRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const curtain = curtainRef.current;
      if (!curtain || !document.documentElement.classList.contains(INTRO_PENDING_CLASS)) return;

      // From here the script owns the curtain: the CSS failsafe is cancelled.
      curtain.style.animation = 'none';
      const media = gsap.matchMedia();

      // Reduced motion: the head script normally keeps the curtain from ever showing, but if the
      // preference is set when this runs, the curtain is simply removed — no motion at all.
      media.add(REDUCED_QUERY, () => {
        gsap.set(curtain, { display: 'none' });
        settleIntro();
      });

      media.add(MOTION_QUERY, () => {
        // Display is held inline so that ending the pending state (at lift-off) does not cut the
        // curtain away mid-motion.
        gsap.set(curtain, { display: 'grid' });
        return play(curtain);
      });

      return () => media.revert();
    },
    { scope: curtainRef },
  );

  return (
    <div
      ref={curtainRef}
      data-intro-curtain
      aria-hidden
      className="fixed inset-0 z-[60] place-items-center bg-espresso-800"
    >
      <div data-intro-stage className="flex flex-col items-center gap-[clamp(1.5rem,4vh,2.75rem)]">
        <picture data-intro-art className="block w-[min(64vw,48vh,26rem)] opacity-0">
          <source
            type="image/avif"
            srcSet="/brand/latte-art-520.avif 520w, /brand/latte-art-1040.avif 1040w"
            sizes="(min-width: 640px) 26rem, 64vw"
          />
          <source
            type="image/webp"
            srcSet="/brand/latte-art-520.webp 520w, /brand/latte-art-1040.webp 1040w"
            sizes="(min-width: 640px) 26rem, 64vw"
          />
          <img
            src="/brand/latte-art-520.webp"
            width={1040}
            height={1040}
            alt=""
            loading="lazy"
            className="h-auto w-full"
          />
        </picture>
        <div className="overflow-hidden pb-[0.35em]">
          <img
            data-intro-word
            src={logoSrc}
            width={640}
            height={150}
            alt=""
            className="block h-auto w-[min(52vw,17rem)] translate-y-[110%]"
          />
        </div>
      </div>
      <div data-intro-edge className="absolute inset-x-0 top-full">
        {/* Lazy on purpose: it loads the moment the curtain shows, and never on a repeat visit. */}
        <CoffeeEdge pour="a" side="bottom" />
      </div>
    </div>
  );
}

/**
 * The curtain's one timeline: the latte settles, the wordmark rises, then the curtain lifts,
 * trailing its coffee edge, while the cup drifts up a little faster than it. Returns its cleanup.
 */
function play(curtain: HTMLDivElement): () => void {
  const art = curtain.querySelector<HTMLElement>('[data-intro-art]');
  const word = curtain.querySelector<HTMLElement>('[data-intro-word]');
  const stage = curtain.querySelector<HTMLElement>('[data-intro-stage]');
  const artImage = art?.querySelector('img');
  const edge = curtain.querySelector<HTMLElement>('[data-intro-edge]');
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => gsap.set(curtain, { display: 'none' }),
  });

  tl.fromTo(
    art,
    { autoAlpha: 0, scale: 0.84, rotate: -24, filter: 'blur(10px)' },
    {
      autoAlpha: 1,
      scale: 1,
      rotate: 0,
      filter: 'blur(0px)',
      duration: DURATION.slow + 0.2,
      ease: EASE.out,
    },
    0,
  )
    .fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: DURATION.slow, ease: EASE.out }, 0.45)
    .addLabel('lift', LIFT_AT)
    .call(settleIntro, [], 'lift')
    // Far enough that the coffee edge hanging below the curtain clears the viewport too.
    .to(
      curtain,
      {
        y: () => -(curtain.offsetHeight + (edge?.offsetHeight ?? 0)),
        duration: DURATION.slow + 0.1,
        ease: EASE.inOut,
      },
      'lift',
    )
    .to(
      stage,
      { yPercent: -35, autoAlpha: 0, duration: DURATION.slow - 0.25, ease: 'power2.in' },
      'lift',
    );

  // Any key or tap skips straight to the lift.
  const skip = () => {
    if (tl.time() < LIFT_AT) tl.seek('lift').timeScale(1.4);
  };
  window.addEventListener('keydown', skip, { once: true });
  curtain.addEventListener('pointerdown', skip, { once: true });

  // Start once the latte art is decoded (or after a short wait), never on a half-drawn image.
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    tl.play();
  };
  const timer = window.setTimeout(start, IMAGE_WAIT_MS);
  artImage?.decode().then(start, start);

  return () => {
    window.clearTimeout(timer);
    window.removeEventListener('keydown', skip);
    curtain.removeEventListener('pointerdown', skip);
    tl.kill();
  };
}
