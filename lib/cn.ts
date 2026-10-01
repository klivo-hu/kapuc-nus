import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge must know the project's own type scale: without it, `text-small` looks like a
 * color and would silently evict `text-primary-foreground` from the same element.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display', 'h1', 'h2', 'h3', 'h4', 'lead', 'body', 'small', 'meta', 'script'] },
      ],
    },
  },
});

/** Merge class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
