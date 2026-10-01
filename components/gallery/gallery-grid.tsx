'use client';

import { useRef, useState } from 'react';
import { Picture } from '@/components/media/picture';
import { cn } from '@/lib/cn';
import type { GalleryCategory, GalleryItem } from '@/lib/content/types';
import { EASE, SCROLL_REVEAL } from '@/lib/design/motion';
import { MOTION_QUERY, ScrollTrigger, gsap, useGSAP } from '@/lib/motion/gsap';
import { Lightbox } from './lightbox';
import { tileClass, tileSizes } from './tile-layout';
import { typeset } from '@/lib/format/typeset';

interface GalleryGridProps {
  readonly items: readonly GalleryItem[];
  readonly categories: readonly GalleryCategory[];
}

const ALL = 'osszes';

/**
 * The gallery: an editorial grid of photographs with category filters, each tile opening the
 * lightbox. Tiles rise into view in batches (one ScrollTrigger batch, not one trigger per tile);
 * hover and focus reveal the title over a scrim without moving the photograph itself.
 */
export function GalleryGrid({ items, categories }: GalleryGridProps) {
  const gridRef = useRef<HTMLUListElement>(null);
  const tileButtons = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [filter, setFilter] = useState(ALL);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [lastOpenedId, setLastOpenedId] = useState<number | null>(null);

  const usedCategories = categories.filter((category) =>
    items.some((item) => item.categoryId === category.id),
  );
  const activeCategory = usedCategories.find((category) => category.slug === filter);
  const visible = activeCategory
    ? items.filter((item) => item.categoryId === activeCategory.id)
    : items;

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(MOTION_QUERY, () => {
        const tiles = gsap.utils.toArray<HTMLElement>('[data-tile]');
        // Opacity, not visibility: a tile waiting to be revealed must stay reachable by keyboard.
        gsap.set(tiles, { opacity: 0, y: 32 });
        ScrollTrigger.batch(tiles, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: SCROLL_REVEAL,
              ease: EASE.out,
              stagger: 0.06,
              overwrite: true,
            }),
        });
      });
      return () => media.revert();
    },
    { scope: gridRef, dependencies: [filter], revertOnUpdate: true },
  );

  return (
    <>
      {usedCategories.length > 1 ? (
        <div
          role="group"
          aria-label="Szűrés kategóriára"
          className="shell mb-10 flex flex-wrap gap-2"
        >
          {[{ slug: ALL, name: 'Összes' }, ...usedCategories].map((category) => (
            <button
              key={category.slug}
              type="button"
              aria-pressed={filter === category.slug}
              onClick={() => setFilter(category.slug)}
              className={cn(
                'rounded-md px-4 py-2 text-small transition-colors',
                filter === category.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-cream-200 text-foreground hover:bg-cream-300',
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}

      <ul
        ref={gridRef}
        className="shell grid grid-flow-dense auto-rows-[clamp(9rem,26vw,12rem)] grid-cols-2 gap-3 md:auto-rows-[clamp(10rem,15vw,13rem)] md:grid-cols-6 md:gap-4 lg:grid-cols-12 lg:gap-5"
      >
        {visible.map((item, index) => (
          <li key={item.id} data-tile className={tileClass(index)}>
            <button
              type="button"
              ref={(element) => {
                if (element) tileButtons.current.set(item.id, element);
                else tileButtons.current.delete(item.id);
              }}
              onClick={() => {
                setLastOpenedId(item.id);
                setOpenIndex(index);
              }}
              className="group relative block h-full w-full overflow-hidden rounded-lg text-left"
            >
              <Picture image={item.image} alt={item.alt} sizes={tileSizes(index)} />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso-900/75 via-espresso-900/25 to-transparent px-4 pb-4 pt-12 opacity-0 transition-opacity duration-slow ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="block translate-y-1 font-serif text-h4 text-cream-50 transition-transform duration-slow ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0">
                  {typeset(item.title || item.alt)}
                </span>
              </span>
              <span className="sr-only">– megnyitás nagyobb méretben</span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        items={visible}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => {
          setOpenIndex(null);
          if (lastOpenedId !== null) tileButtons.current.get(lastOpenedId)?.focus();
        }}
      />
    </>
  );
}
