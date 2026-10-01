'use client';

import Link from 'next/link';
import { useEffect, useRef, type RefObject } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { DURATION, EASE, STAGGER } from '@/lib/design/motion';
import { MOTION_QUERY, REDUCED_QUERY, gsap, useGSAP } from '@/lib/motion/gsap';
import { PRIMARY_NAV, isCurrent } from '@/lib/site/navigation';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MobileMenuProps {
  readonly open: boolean;
  readonly pathname: string;
  readonly directionsUrl: string;
  /** The header, which holds both the toggle and this panel: focus is kept inside it. */
  readonly containerRef: RefObject<HTMLElement | null>;
  readonly onClose: (returnFocus: boolean) => void;
}

/**
 * The small-screen menu: a full-height cream panel under the floating bar. It opens with one
 * GSAP timeline — the panel uncovers from the top, the links rise in order — and closes by
 * reversing it. It stays mounted and is hidden with visibility, so it is out of the
 * accessibility tree while closed.
 */
export function MobileMenu({
  open,
  pathname,
  directionsUrl,
  containerRef,
  onClose,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      const media = gsap.matchMedia();
      media.add({ motion: MOTION_QUERY, reduced: REDUCED_QUERY }, (context) => {
        const reduced = Boolean(context.conditions?.reduced);
        // Hidden explicitly at the end of a close: the open path reveals the panel before the
        // timeline records its start, so reversing alone would leave it visible.
        const tl = gsap.timeline({
          paused: true,
          onReverseComplete: () => gsap.set(panel, { autoAlpha: 0 }),
        });
        tl.set(panel, { autoAlpha: 1 });
        if (!reduced) {
          tl.fromTo(
            panel,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: DURATION.base, ease: EASE.out },
            0,
          ).from(
            '[data-menu-item]',
            { y: 28, opacity: 0, duration: DURATION.base, ease: EASE.outSoft, stagger: STAGGER },
            0.12,
          );
        }
        timeline.current = tl;
        return () => {
          tl.kill();
          timeline.current = null;
        };
      });
      return () => media.revert();
    },
    { scope: panelRef },
  );

  // Opening reveals the panel synchronously, so focus can move into it at once; the timeline
  // then animates what is already there. Closing plays the same timeline backwards.
  useEffect(() => {
    const tl = timeline.current;
    const panel = panelRef.current;
    if (!tl || !panel) return;
    if (open) {
      // With motion, the panel starts fully clipped so its first frame is the closed state.
      gsap.set(panel, {
        autoAlpha: 1,
        ...(tl.duration() > 0 ? { clipPath: 'inset(0% 0% 100% 0%)' } : {}),
      });
      tl.timeScale(1).play();
      panel.querySelector<HTMLElement>('a[href]')?.focus();
    } else {
      tl.timeScale(1.6).reverse();
      if (tl.duration() === 0) gsap.set(panel, { autoAlpha: 0 });
    }
  }, [open]);

  // While open: the page behind does not scroll, Escape closes, and Tab stays inside the header.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose(true);
        return;
      }
      if (event.key !== 'Tab' || !containerRef.current) return;
      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      root.style.overflow = previousOverflow;
    };
  }, [open, onClose, containerRef]);

  return (
    <div
      ref={panelRef}
      id="mobile-menu"
      className="invisible fixed inset-0 z-0 overflow-y-auto bg-cream-100 lg:hidden"
    >
      <nav
        aria-label="Mobil menü"
        className="shell flex min-h-full flex-col justify-between pb-10 pt-[calc(var(--cef-space-nav)+var(--cef-space-nav-offset)*2+2.5rem)]"
      >
        <ul className="space-y-1">
          {PRIMARY_NAV.map((link) => (
            <li key={link.href} data-menu-item>
              <Link
                href={link.href}
                aria-current={isCurrent(link.href, pathname) ? 'page' : undefined}
                onClick={() => onClose(false)}
                className="block py-2 font-serif text-h2 text-foreground aria-[current=page]:text-mocha-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div data-menu-item className="mt-12 grid gap-3 xs:grid-cols-2">
          <ButtonLink href={directionsUrl} external size="lg">
            Útvonaltervezés
          </ButtonLink>
          <ButtonLink href="/etlap" variant="secondary" size="lg">
            Étlap és itallap
          </ButtonLink>
        </div>
      </nav>
    </div>
  );
}
