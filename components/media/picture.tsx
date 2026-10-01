import type { CSSProperties } from 'react';
import type { ImageAsset } from '@/lib/content/types';
import { cn } from '@/lib/cn';
import { mediaUrl, pickWidth, srcSet } from '@/lib/media/urls';

const FALLBACK_WIDTH = 1200;

interface PictureProps {
  readonly image: ImageAsset;
  readonly alt: string;
  /** The rendered width at each breakpoint — what lets the browser pick the right variant. */
  readonly sizes: string;
  /** Above-the-fold imagery: loaded eagerly at high priority, and shown without the fade. */
  readonly priority?: boolean;
  /**
   * `fill` crops the image to its parent (which sets the shape); `intrinsic` keeps the image's
   * own aspect ratio. Either way the box is sized before the file arrives, so nothing shifts.
   */
  readonly layout?: 'fill' | 'intrinsic';
  /** Paint the image's mean color behind it while it loads. Off where the image is letterboxed. */
  readonly placeholder?: boolean;
  readonly className?: string;
  readonly imgClassName?: string;
}

/**
 * A responsive image from the media store: AVIF first, WebP second, with explicit dimensions and
 * the image's own mean color behind it while it loads. Non-priority images fade in once decoded
 * (see globals.css), so a picture arrives whole instead of painting in bands.
 */
export function Picture({
  image,
  alt,
  sizes,
  priority = false,
  layout = 'fill',
  placeholder = true,
  className,
  imgClassName,
}: PictureProps) {
  const fill = layout === 'fill';
  const wrapperStyle: CSSProperties = {
    backgroundColor: placeholder ? image.color : undefined,
    ...(fill ? {} : { aspectRatio: `${image.width} / ${image.height}` }),
  };

  return (
    <picture
      className={cn('block overflow-hidden', fill && 'absolute inset-0', className)}
      style={wrapperStyle}
    >
      <source type="image/avif" srcSet={srcSet(image, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image, 'webp')} sizes={sizes} />
      <img
        src={mediaUrl(image.id, pickWidth(image, FALLBACK_WIDTH), 'webp')}
        alt={alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        data-fade={priority ? undefined : ''}
        // The pre-paint load listener marks the image `data-loaded` before React hydrates; that
        // attribute is expected to differ from the server HTML.
        suppressHydrationWarning
        className={cn('h-full w-full', fill && 'object-cover', imgClassName)}
        style={{ objectPosition: `${image.focalX}% ${image.focalY}%` }}
      />
    </picture>
  );
}
