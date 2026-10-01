import { Instrument_Sans, Newsreader, Oooh_Baby } from 'next/font/google';

/**
 * The type system: three families, each with one job, all self-hosted by next/font at build time
 * (no request to Google at runtime) and all carrying latin-ext for ő and ű.
 *
 * - Newsreader — editorial serif with optical sizes, for headings and storytelling. Variable, so
 *   one file covers every weight used.
 * - Instrument Sans — the working voice: navigation, body, controls. Variable weight.
 * - Oooh Baby — a light, upright handwriting whose letters read as everyday Hungarian script:
 *   a plain latin "z" (no Cyrillic-looking loop), clear ő and ű. Decorative notes only, never
 *   navigation, controls, or running text; not preloaded, since it is never critical text.
 */
export const serif = Newsreader({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});

export const sans = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
});

export const script = Oooh_Baby({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  display: 'swap',
  preload: false,
  variable: '--font-script',
});

export const fontVariables = `${serif.variable} ${sans.variable} ${script.variable}`;
