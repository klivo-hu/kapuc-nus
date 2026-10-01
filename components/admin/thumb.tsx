import { ImageOff } from 'lucide-react';
import type { ImageAsset } from '@/lib/content/types';
import { cn } from '@/lib/cn';
import { mediaUrl, pickWidth } from '@/lib/media/urls';

/** A small, cropped preview of a media-store image for admin lists. */
export function Thumb({
  image,
  alt = '',
  className,
}: {
  readonly image: ImageAsset | null;
  readonly alt?: string;
  readonly className?: string;
}) {
  if (!image) {
    return (
      <span
        className={cn(
          'flex items-center justify-center rounded-md bg-cream-200 text-muted',
          className,
        )}
      >
        <ImageOff aria-hidden className="size-5" />
        <span className="sr-only">Nincs kép</span>
      </span>
    );
  }
  return (
    <img
      src={mediaUrl(image.id, pickWidth(image, 480), 'webp')}
      alt={alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      className={cn('rounded-md object-cover', className)}
      style={{ objectPosition: `${image.focalX}% ${image.focalY}%`, backgroundColor: image.color }}
    />
  );
}
