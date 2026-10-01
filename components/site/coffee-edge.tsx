import { cn } from '@/lib/cn';

/** Two different pours, so neighbouring edges never repeat. */
export type CoffeeEdgePour = 'a' | 'b';

interface CoffeeEdgeProps {
  readonly pour: CoffeeEdgePour;
  /** `top` crowns a brown section (the coffee rises into the cream above); `bottom` hangs below it. */
  readonly side: 'top' | 'bottom';
  readonly flipX?: boolean;
  readonly className?: string;
}

const srcSet = (pour: CoffeeEdgePour, ext: 'avif' | 'webp') =>
  `/brand/coffee-edge-${pour}-1440.${ext} 1440w, /brand/coffee-edge-${pour}-2880.${ext} 2880w`;

/**
 * The section transition: the coffee brown of a section diffusing into the cream beside it, the
 * way milk and coffee fold into each other in an iced coffee. The artwork is rendered at build
 * time (scripts/coffee-edge.mjs) with the solid brown along its top edge, matching the section
 * colour exactly; above a section it is flipped so the coffee rises instead of hangs.
 *
 * It sits in the document flow, reaching at most into a neighbour's empty padding (callers pull
 * it in with a negative margin), so it never covers content. It is decorative: hidden from
 * assistive technology, never focusable, never a target.
 */
export function CoffeeEdge({ pour, side, flipX = false, className }: CoffeeEdgeProps) {
  return (
    <picture
      aria-hidden
      className={cn(
        'pointer-events-none relative block select-none',
        // Overlap the section by a pixel so no sub-pixel seam can open between them.
        side === 'top' ? '-mb-px' : '-mt-px',
        className,
      )}
    >
      <source type="image/avif" srcSet={srcSet(pour, 'avif')} sizes="100vw" />
      <source type="image/webp" srcSet={srcSet(pour, 'webp')} sizes="100vw" />
      <img
        src={`/brand/coffee-edge-${pour}-1440.webp`}
        width={1440}
        height={320}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn(
          'block h-[clamp(5.5rem,22.2vw,26rem)] w-full object-cover object-top',
          side === 'top' && '-scale-y-100',
          flipX && '-scale-x-100',
        )}
      />
    </picture>
  );
}
