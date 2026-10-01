import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { LEGAL_NAV } from '@/lib/site/navigation';

/** Read at request time so the URLs always carry the configured SITE_URL. */
export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${env.siteUrl}${path}`;
  return [
    { url: url('/'), changeFrequency: 'weekly', priority: 1 },
    { url: url('/etlap'), changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/rolunk'), changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/galeria'), changeFrequency: 'weekly', priority: 0.7 },
    ...LEGAL_NAV.map((link) => ({
      url: url(link.href),
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ];
}
