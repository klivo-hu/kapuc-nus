import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { JsonLd } from '@/components/seo/json-ld';
import { PageIntro } from '@/components/site/page-intro';
import { VisitBand } from '@/components/site/visit-band';
import { listGallery, listGalleryCategories } from '@/lib/content/gallery';
import { getSettings } from '@/lib/content/settings';
import { env } from '@/lib/env';
import { directionsHref } from '@/lib/format/location';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Galéria';

export function generateMetadata(): Metadata {
  const first = listGallery({ activeOnly: true })[0];
  return pageMetadata({
    title: TITLE,
    description: 'Kávé, torták, limonádék és a terasz: képek a Kapucinus Kávézóból.',
    canonical: '/galeria',
    imageId: first?.image.id,
  });
}

export default function GalleryPage() {
  const items = listGallery({ activeOnly: true });
  const location = getSettings('location');

  return (
    <>
      <PageIntro
        crumb={TITLE}
        title={TITLE}
        lead="Egy kis ízelítő a pultról, a vitrinből és a teraszról. Kattints egy képre a nagyobb nézethez."
      />
      {items.length > 0 ? (
        <GalleryGrid items={items} categories={listGalleryCategories()} />
      ) : (
        <section className="shell">
          <div className="max-w-xl rounded-lg bg-cream-200 p-8">
            <h2 className="text-h3 text-foreground">Hamarosan új képekkel jelentkezünk</h2>
            <p className="mt-3 text-body text-muted">
              A galéria épp frissül. Addig is gyere el, és nézd meg személyesen.
            </p>
          </div>
        </section>
      )}
      <VisitBand directionsUrl={directionsHref(location)} />
      <JsonLd data={breadcrumbJsonLd(env.siteUrl, [{ name: TITLE, path: '/galeria' }])} />
    </>
  );
}
