import type { ImageAsset } from '@/lib/content/types';

export type ImageFormat = 'avif' | 'webp';

export function mediaUrl(id: string, width: number, format: ImageFormat): string {
  return `/media/${id}/${width}.${format}`;
}

export function srcSet(image: ImageAsset, format: ImageFormat): string {
  return image.widths.map((width) => `${mediaUrl(image.id, width, format)} ${width}w`).join(', ');
}

/** The smallest encoded width at least as wide as `target`, or the largest there is. */
export function pickWidth(image: ImageAsset, target: number): number {
  return image.widths.find((width) => width >= target) ?? image.widths.at(-1) ?? image.width;
}

/** A 1200×630 JPEG crop around the focal point, for Open Graph and structured data. */
export function ogImageUrl(id: string): string {
  return `/media/${id}/og.jpg`;
}
