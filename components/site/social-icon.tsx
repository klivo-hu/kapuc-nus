import { Facebook, Globe, Instagram } from 'lucide-react';
import type { SocialNetwork } from '@/lib/site/social';

/** TikTok's mark, drawn at icon scale (lucide has no TikTok glyph). */
function TikTok({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      className={className}
      fill="currentColor"
    >
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.77a5.73 5.73 0 0 0-.77-.05 5.68 5.68 0 1 0 5.68 5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
    </svg>
  );
}

export function SocialIcon({
  network,
  className,
}: {
  readonly network: SocialNetwork;
  readonly className?: string;
}) {
  switch (network) {
    case 'instagram':
      return <Instagram aria-hidden className={className} />;
    case 'facebook':
      return <Facebook aria-hidden className={className} />;
    case 'tiktok':
      return <TikTok className={className} />;
    default:
      return <Globe aria-hidden className={className} />;
  }
}
