'use client';

import { useRef, type ReactNode } from 'react';
import { MOTION_QUERY, gsap, useGSAP } from '@/lib/motion/gsap';

/** True after the first page has mounted; only later, in-app navigations get the transition. */
let hasMounted = false;

/**
 * The page transition: on an in-app navigation the new page settles into place — a short fade
 * and rise, under half a second, that never delays the navigation itself. The first page load
 * has no transition (the content is already painted), and reduced motion has none at all.
 */
export function PageEnter({ children }: { readonly children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!hasMounted) {
        hasMounted = true;
        return;
      }
      const media = gsap.matchMedia();
      media.add(MOTION_QUERY, () => {
        gsap.from(ref.current, {
          autoAlpha: 0,
          y: 14,
          duration: 0.45,
          ease: 'power2.out',
          clearProps: 'all',
        });
      });
      return () => media.revert();
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
