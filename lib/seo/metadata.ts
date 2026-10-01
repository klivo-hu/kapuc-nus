import 'server-only';
import type { Metadata } from 'next';
import { getMedia } from '@/lib/content/media';
import { getSettings } from '@/lib/content/settings';
import { ogImageUrl } from '@/lib/media/urls';

interface PageMetadataInput {
  /** Page title; the brand is appended by the site layout's title template. */
  readonly title?: string;
  readonly description: string;
  /** Site-relative canonical path, e.g. "/etlap". */
  readonly canonical: string;
  /** An image to share this page with; falls back to the site's sharing image. */
  readonly imageId?: string | null;
}

/**
 * Per-page metadata: a unique title and description, a self-referencing canonical URL, and
 * matching Open Graph and Twitter cards. Relative URLs resolve against metadataBase (SITE_URL).
 */
export function pageMetadata({
  title,
  description,
  canonical,
  imageId,
}: PageMetadataInput): Metadata {
  const site = getSettings('site');
  const image = getMedia(imageId ?? null) ?? getMedia(site.ogImageId);
  const images = image
    ? [{ url: ogImageUrl(image.id), width: 1200, height: 630, alt: title ?? site.brandName }]
    : undefined;
  const fullTitle = title ? `${title} – ${site.brandName}` : site.seoTitle;

  return {
    ...(title ? { title } : { title: { absolute: site.seoTitle } }),
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'hu_HU',
      siteName: site.brandName,
      url: canonical,
      title: fullTitle,
      description,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      images: images?.map((entry) => entry.url),
    },
  };
}
