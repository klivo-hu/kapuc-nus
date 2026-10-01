/**
 * The gallery's editorial rhythm: a repeating six-tile phrase that fills its block exactly at
 * every breakpoint, so `grid-auto-flow: dense` never has a hole to back-fill and every cycle
 * starts on a clean row. Each photograph is cropped around its own focal point.
 *
 *   large screens, 12 × 5:  AAAAA BBBB CCC      small screens, 2 × 5:  AA
 *                           AAAAA BBBB CCC                             AA
 *                           AAAAA DDDD CCC                             BC
 *                           EEEEE DDDD FFF                             DE
 *                           EEEEE DDDD FFF                             DF
 *
 *   tablets, 6 × 6:  AAAA BB / AAAA BB / AAAA CC / DD EE CC / DD EE CC / FFFFFF
 */
const PHRASE = [
  'col-span-2 row-span-2 md:col-span-4 md:row-span-3 lg:col-span-5 lg:row-span-3',
  'col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-2',
  'col-span-1 row-span-1 md:col-span-2 md:row-span-3 lg:col-span-3 lg:row-span-3',
  'col-span-1 row-span-2 md:col-span-2 md:row-span-2 lg:col-span-4 lg:row-span-3',
  'col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-5 lg:row-span-2',
  'col-span-1 row-span-1 md:col-span-6 md:row-span-1 lg:col-span-3 lg:row-span-2',
] as const;

/** Rendered widths per phrase position, for each tile's `sizes` attribute. */
const SIZES = [
  '(min-width: 1024px) 40vw, (min-width: 768px) 66vw, 100vw',
  '(min-width: 1024px) 32vw, (min-width: 768px) 33vw, 50vw',
  '(min-width: 1024px) 24vw, (min-width: 768px) 33vw, 50vw',
  '(min-width: 1024px) 32vw, (min-width: 768px) 33vw, 50vw',
  '(min-width: 1024px) 40vw, (min-width: 768px) 33vw, 50vw',
  '(min-width: 1024px) 24vw, (min-width: 768px) 100vw, 50vw',
] as const;

export function tileClass(index: number): string {
  return PHRASE[index % PHRASE.length]!;
}

export function tileSizes(index: number): string {
  return SIZES[index % SIZES.length]!;
}
