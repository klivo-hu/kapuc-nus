'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { Picture } from '@/components/media/picture';
import type { GalleryItem } from '@/lib/content/types';
import { DURATION, EASE } from '@/lib/design/motion';
import { MOTION_QUERY, gsap, useGSAP } from '@/lib/motion/gsap';
import { mediaUrl, pickWidth } from '@/lib/media/urls';
import { typeset } from '@/lib/format/typeset';

/** A horizontal drag longer than this, in pixels, turns the page. */
const SWIPE_THRESHOLD_PX = 48;

interface LightboxProps {
  readonly items: readonly GalleryItem[];
  /** Index of the open item, or null when closed. */
  readonly index: number | null;
  readonly onIndexChange: (index: number) => void;
  readonly onClose: () => void;
}

/**
 * The gallery's full-screen viewer, built on a native modal <dialog>: the browser makes the page
 * behind it inert, keeps focus inside, and closes it on Escape. Arrow keys and horizontal swipes
 * move between photographs; the neighbors are fetched ahead so the next one is already there.
 */
export function Lightbox({ items, index, onIndexChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<number | null>(null);
  const open = index !== null;
  const item = index !== null ? items[index] : undefined;
  const count = items.length;

  const step = (delta: number) => {
    if (index === null || count < 2) return;
    onIndexChange((index + delta + count) % count);
  };

  // Opening and closing the native dialog is an imperative DOM call.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Fetch the neighbors of the open photograph ahead of time.
  useEffect(() => {
    if (index === null || count < 2) return;
    for (const neighbor of [items[(index + 1) % count], items[(index - 1 + count) % count]]) {
      if (!neighbor) continue;
      const preload = new Image();
      preload.src = mediaUrl(
        neighbor.image.id,
        pickWidth(neighbor.image, window.innerWidth * window.devicePixelRatio),
        'webp',
      );
    }
  }, [index, items, count]);

  // Each photograph arrives with a short fade and settle; the finished state under reduced motion.
  useGSAP(
    () => {
      if (!open) return;
      const media = gsap.matchMedia();
      media.add(MOTION_QUERY, () => {
        gsap.fromTo(
          '[data-lightbox-figure]',
          { autoAlpha: 0, scale: 0.975 },
          { autoAlpha: 1, scale: 1, duration: DURATION.base, ease: EASE.out },
        );
      });
      return () => media.revert();
    },
    { scope: stageRef, dependencies: [index, open], revertOnUpdate: true },
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  };

  const onPointerDown = (event: ReactPointerEvent) => {
    pointerStart.current = event.clientX;
  };
  const onPointerUp = (event: ReactPointerEvent) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) > SWIPE_THRESHOLD_PX) step(distance < 0 ? 1 : -1);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={item ? `${item.title || item.alt} – ${(index ?? 0) + 1} / ${count}` : 'Galéria'}
      onKeyDown={onKeyDown}
      onClose={() => {
        document.documentElement.style.overflow = '';
        onClose();
      }}
      // A click on the backdrop (the dialog element itself, not its content) closes it.
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      className="surface-dark m-0 h-[100dvh] max-h-none w-screen max-w-none bg-espresso-900 p-0 text-cream-50 backdrop:bg-espresso-900/95"
    >
      {item ? (
        <div ref={stageRef} className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="tabular text-small text-cream-300" aria-hidden>
              {(index ?? 0) + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex size-11 items-center justify-center rounded-md transition-colors hover:bg-cream-50/10"
              autoFocus
            >
              <X aria-hidden className="size-6" />
              <span className="sr-only">Bezárás</span>
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-4 sm:px-20"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              pointerStart.current = null;
            }}
          >
            <figure data-lightbox-figure className="relative h-full w-full">
              <Picture
                key={item.id}
                image={item.image}
                alt={item.alt}
                sizes="100vw"
                priority
                placeholder={false}
                imgClassName="object-contain"
              />
            </figure>

            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-md bg-espresso-900/60 transition-colors hover:bg-cream-50/15 sm:flex"
                >
                  <ChevronLeft aria-hidden className="size-6" />
                  <span className="sr-only">Előző kép</span>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-md bg-espresso-900/60 transition-colors hover:bg-cream-50/15 sm:flex"
                >
                  <ChevronRight aria-hidden className="size-6" />
                  <span className="sr-only">Következő kép</span>
                </button>
              </>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-6 px-4 pb-6 pt-4 sm:px-6">
            <div className="max-w-2xl">
              {item.title ? <p className="font-serif text-h4">{typeset(item.title)}</p> : null}
              {item.description ? (
                <p className="mt-1 text-small text-cream-300">{typeset(item.description)}</p>
              ) : null}
            </div>
            {count > 1 ? (
              <div className="flex gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="flex size-11 items-center justify-center rounded-md bg-cream-50/10"
                >
                  <ChevronLeft aria-hidden className="size-5" />
                  <span className="sr-only">Előző kép</span>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="flex size-11 items-center justify-center rounded-md bg-cream-50/10"
                >
                  <ChevronRight aria-hidden className="size-5" />
                  <span className="sr-only">Következő kép</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
