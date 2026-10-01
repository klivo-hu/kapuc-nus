/**
 * Motion tokens for GSAP, in seconds (GSAP's unit). The CSS side of the same scale lives in
 * styles/tokens.css; the two are kept in step by hand and named alike.
 *
 * Every curve decelerates. Nothing overshoots: the café's motion is poured, not bounced.
 */
export const DURATION = {
  /** Hover and press feedback. */
  fast: 0.18,
  /** Text lines entering, a panel opening. */
  base: 0.6,
  /** An image uncovered, the curtain lifting. */
  slow: 1.1,
} as const;

export const EASE = {
  /** Exponential ease-out: arrives quickly, settles slowly. The default for every entrance. */
  out: 'expo.out',
  /** A gentler ease-out for text, where expo reads as a snap. */
  outSoft: 'power3.out',
  /** For surfaces that travel the whole screen: starts and ends at rest. */
  inOut: 'expo.inOut',
} as const;

/**
 * Scroll-triggered entrances stay under a second (GS-17): a reveal that outlasts the scroll that
 * started it reads as lag.
 */
export const SCROLL_REVEAL = 0.9;

/** Stagger between sibling lines or items, in seconds. */
export const STAGGER = 0.07;

/** How long a hero slide stays before the next one, in seconds: time to read it, then move on. */
export const HERO_INTERVAL = 8;
