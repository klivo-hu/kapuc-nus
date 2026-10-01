'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface CategoryNavProps {
  readonly categories: readonly { readonly slug: string; readonly name: string }[];
}

/**
 * The menu's category bar: sticky under the floating navigation (and following it up when it
 * tucks away), horizontally scrollable on small screens, and marking the section being read.
 */
export function CategoryNav({ categories }: CategoryNavProps) {
  const [current, setCurrent] = useState(categories[0]?.slug ?? '');
  const listRef = useRef<HTMLUListElement>(null);

  // Which section is in view is only knowable from the observer, not from render.
  useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(category.slug))
      .filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        const topmost = visible.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        )[0];
        if (topmost) setCurrent(topmost.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories]);

  // Keep the active link in view inside the scrollable bar.
  useEffect(() => {
    const link = listRef.current?.querySelector<HTMLElement>(
      `[data-slug="${CSS.escape(current)}"]`,
    );
    link?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [current]);

  return (
    <nav
      aria-label="Kategóriák"
      className="sticky top-[calc(var(--cef-space-nav)+var(--cef-space-nav-offset)*2)] z-20 bg-background/100 transition-[top] duration-slow ease-out [html[data-nav-tucked]_&]:top-0"
    >
      <div className="shell">
        <ul
          ref={listRef}
          className="-mx-2 flex gap-1 overflow-x-auto border-b border-border py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => (
            <li key={category.slug} className="shrink-0">
              <a
                href={`#${category.slug}`}
                data-slug={category.slug}
                aria-current={current === category.slug ? 'true' : undefined}
                className={cn(
                  'block rounded-md px-3 py-2 text-small transition-colors',
                  current === category.slug
                    ? 'bg-cream-200 font-medium text-foreground'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
