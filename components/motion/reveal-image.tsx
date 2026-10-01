'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { EASE, SCROLL_REVEAL } from '@/lib/design/motion';
import { MOTION_QUERY, gsap, useGSAP } from '@/lib/motion/gsap';

/**
 * An editorial photograph that is uncovered from below the first time it scrolls into view,
 * settling from a slight zoom as it opens — the page's image entrance, used for the few
 * photographs that carry a section rather than for every image.
 *
 * The frame (this element) keeps its rounded shape and size throughout; only the picture inside
 * is clipped, so the layout never moves. The picture is visible in the markup; the script hides
 * it a frame before revealing it, and only when motion is allowed.
 */
export function RevealImage({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const frame = frameRef.current;
      const picture = frame?.firstElementChild;
      if (!frame || !picture) return;
      const media = gsap.matchMedia();
      media.add(MOTION_QUERY, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
        });
        tl.fromTo(
          picture,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: SCROLL_REVEAL, ease: EASE.out },
        ).fromTo(
          picture.querySelector('img'),
          { scale: 1.12 },
          { scale: 1, duration: SCROLL_REVEAL, ease: EASE.out, clearProps: 'transform' },
          0,
        );
      });
      return () => media.revert();
    },
    { scope: frameRef },
  );

  return (
    <div ref={frameRef} className={cn('relative overflow-hidden', className)}>
      {children}
    </div>
  );
}
