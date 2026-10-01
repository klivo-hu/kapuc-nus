import 'server-only';
import { getMedia } from '@/lib/content/media';
import type { SiteSettings } from '@/lib/content/settings-schema';
import { mediaUrl, pickWidth } from '@/lib/media/urls';

export interface BrandMark {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

/** The wordmark extracted from the café's logo by scripts/prepare-assets.mjs (640×150). */
const WORDMARK = { width: 640, height: 150 } as const;
const LOGO_TARGET_WIDTH = 480;

/**
 * The logo to render: an uploaded one from the admin if set, otherwise the café's own wordmark
 * in brown (on light surfaces) or cream (on the dark footer).
 */
export function brandMark(site: SiteSettings, tone: 'dark' | 'light' = 'dark'): BrandMark {
  const uploaded = getMedia(site.logoId);
  if (uploaded) {
    return {
      src: mediaUrl(uploaded.id, pickWidth(uploaded, LOGO_TARGET_WIDTH), 'webp'),
      width: uploaded.width,
      height: uploaded.height,
      alt: site.brandName,
    };
  }
  return {
    src: tone === 'dark' ? '/brand/logo.png' : '/brand/logo-cream.png',
    ...WORDMARK,
    alt: site.brandName,
  };
}
