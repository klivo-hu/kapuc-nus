/**
 * Scroll-motion presets, generated from the CEF design system (change the design system and
 * regenerate rather than editing timings here). Only the presets this surface uses at motion
 * level 2 are kept: the level-3 effects (parallax, pin, scrub) are withheld by policy, and the
 * progress and counter presets have no use on this site.
 *
 * Durations are seconds (GSAP's unit). Every ease is an ease-out family curve: nothing overshoots.
 * A scrubbed preset carries ease 'none' because the scrollbar is already the clock.
 */

export interface ScrollTweenVars {
  readonly opacity?: number;
  readonly x?: number;
  readonly y?: number;
  readonly xPercent?: number;
  readonly yPercent?: number;
  readonly scale?: number;
}

export interface ScrollTriggerVars {
  readonly start: string;
  readonly end?: string;
  readonly scrub?: number | boolean;
  readonly pin?: boolean;
  readonly once?: boolean;
  readonly toggleActions?: string;
  readonly invalidateOnRefresh?: boolean;
}

export interface ScrollPreset {
  readonly from: ScrollTweenVars;
  readonly to?: ScrollTweenVars;
  readonly duration: number;
  readonly ease: string;
  readonly stagger?: number;
  /** The motion level this effect needs (0-4). Compared against MOTION_LEVEL below. */
  readonly minimumLevel: number;
  readonly scrollTrigger: ScrollTriggerVars;
}

export const SCROLL_PRESETS = {
  'reveal-rise': {
    from: { opacity: 0, y: 24 },
    to: undefined,
    duration: 0.4,
    ease: 'power3.out',
    stagger: undefined,
    minimumLevel: 2,
    scrollTrigger: { start: 'top 85%', once: true, toggleActions: 'play none none none' },
  },
  'reveal-stagger': {
    from: { opacity: 0, y: 20 },
    to: undefined,
    duration: 0.4,
    ease: 'power3.out',
    stagger: 0.06,
    minimumLevel: 2,
    scrollTrigger: { start: 'top 80%', once: true, toggleActions: 'play none none none' },
  },
} as const satisfies Record<string, ScrollPreset>;

export type ScrollPresetId = keyof typeof SCROLL_PRESETS;
