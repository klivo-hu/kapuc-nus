'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { BrandMark } from '@/lib/site/brand';
import { PRIMARY_NAV, isCurrent } from '@/lib/site/navigation';
import { MobileMenu } from './mobile-menu';

/** Scrolled past this, the bar may tuck away on the way down. */
const HIDE_AFTER_PX = 160;
/** Ignore scroll jitter smaller than this before changing direction. */
const DIRECTION_THRESHOLD_PX = 8;

interface SiteHeaderProps {
  readonly logo: BrandMark;
  readonly directionsUrl: string;
}

/**
 * The floating navigation. A solid cream bar (no glass) held just below the top edge; it tucks
 * away while reading downward and returns the moment the reader scrolls back up. On small screens
 * the links move into a full-height menu opened from the same bar.
 */
export function SiteHeader({ logo, directionsUrl }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tucked, setTucked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // A navigation (including back/forward) closes the menu. Adjusted during render rather than in
  // an effect, so the new page never paints with the menu still open.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  // Scroll direction is only knowable from scroll events; nothing to derive it from in render.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - lastY) < DIRECTION_THRESHOLD_PX) return;
      setTucked(y > lastY && y > HIDE_AFTER_PX);
      lastY = y;
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  // Other sticky elements (the menu's category bar) follow the bar up when it tucks away.
  useEffect(() => {
    document.documentElement.toggleAttribute('data-nav-tucked', tucked && !menuOpen);
  }, [tucked, menuOpen]);

  const closeMenu = useCallback((returnFocus: boolean) => {
    setMenuOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-40 pt-[var(--cef-space-nav-offset)] transition-transform duration-slow ease-out',
        tucked && !menuOpen && '-translate-y-[calc(100%+var(--cef-space-nav-offset))]',
      )}
      // Keyboard users never lose the bar: focusing anything inside brings it back.
      onFocusCapture={() => setTucked(false)}
    >
      <div className="shell">
        <div
          className={cn(
            'relative z-10 flex h-nav items-center justify-between gap-6 rounded-nav bg-cream-50 pl-5 pr-2 transition-shadow duration-slow sm:pl-6',
            scrolled || menuOpen ? 'shadow-md' : 'shadow-sm',
          )}
        >
          <Link href="/" className="shrink-0 rounded-sm" onClick={() => closeMenu(false)}>
            <img
              src={logo.src}
              width={logo.width}
              height={logo.height}
              alt={`${logo.alt} – főoldal`}
              className="h-[2.1rem] w-auto sm:h-[2.35rem]"
            />
          </Link>

          <nav aria-label="Főmenü" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {PRIMARY_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent(link.href, pathname) ? 'page' : undefined}
                    className="link-draw py-1 text-small font-medium text-foreground/85 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href={directionsUrl} external size="sm" className="hidden lg:inline-flex">
              Útvonaltervezés
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="group/toggle relative flex h-12 w-12 items-center justify-center rounded-md transition-colors hover:bg-cream-200 lg:hidden"
            >
              <span className="sr-only">{menuOpen ? 'Menü bezárása' : 'Menü megnyitása'}</span>
              <span aria-hidden className="relative block h-3 w-6">
                <span
                  className={cn(
                    'absolute left-0 top-0 h-[1.5px] w-6 rounded-full bg-foreground transition-transform duration-slow ease-out',
                    menuOpen && 'translate-y-[5.25px] rotate-45',
                  )}
                />
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-[1.5px] rounded-full bg-foreground transition-[transform,width] duration-slow ease-out',
                    menuOpen ? 'w-6 -translate-y-[5.25px] -rotate-45' : 'w-4',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        pathname={pathname}
        directionsUrl={directionsUrl}
        containerRef={headerRef}
        onClose={closeMenu}
      />
    </header>
  );
}
