import type { Metadata } from 'next';
import { CategoryNav } from '@/components/menu/category-nav';
import { MenuSection } from '@/components/menu/menu-section';
import { JsonLd } from '@/components/seo/json-ld';
import { PageIntro } from '@/components/site/page-intro';
import { ButtonLink } from '@/components/ui/button';
import { listMenu } from '@/lib/content/menu';
import { getSettings } from '@/lib/content/settings';
import { env } from '@/lib/env';
import { directionsHref } from '@/lib/format/location';
import { mediaUrl, pickWidth } from '@/lib/media/urls';
import { breadcrumbJsonLd, menuJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

const TITLE = 'Étlap és itallap';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: TITLE,
    description:
      'Kávék, hideg italok, koktélok, melegszendvicsek, torták és sütemények – vegán és gluténmentes választással is. A Kapucinus Kávézó teljes kínálata.',
    canonical: '/etlap',
  });
}

export default function MenuPage() {
  const sections = listMenu();
  const location = getSettings('location');
  const hasPrices = sections.some((section) =>
    section.products.some((product) => product.price !== null),
  );

  return (
    <>
      <PageIntro
        crumb={TITLE}
        title={TITLE}
        lead="Minden, amit a pult mögül és a vitrinből kérhetsz. Ha allergiád vagy érzékenységed van, szólj nekünk nyugodtan, segítünk választani."
        note="jó étvágyat!"
      />

      {sections.length > 0 ? (
        <>
          <CategoryNav categories={sections.map(({ slug, name }) => ({ slug, name }))} />
          <div className="shell">
            {sections.map((section) => (
              <MenuSection key={section.id} section={section} />
            ))}
            <p className="border-t border-border py-10 text-small text-muted">
              {hasPrices ? 'Az árak forintban értendők. ' : ''}
              Az allergénekről és az összetevőkről a pultnál részletesen tájékoztatunk.
            </p>
          </div>
        </>
      ) : (
        <section className="shell pb-section">
          <div className="max-w-xl rounded-lg bg-cream-200 p-8">
            <h2 className="text-h3 text-foreground">Az étlap épp frissül</h2>
            <p className="mt-3 text-body text-muted">
              Hamarosan itt találod a teljes kínálatot. Addig is nézz be hozzánk, a pultnál mindent
              elmondunk.
            </p>
            <ButtonLink href={directionsHref(location)} external className="mt-6">
              Útvonaltervezés
            </ButtonLink>
          </div>
        </section>
      )}

      <JsonLd
        data={[
          menuJsonLd(
            env.siteUrl,
            sections,
            (image) => `${env.siteUrl}${mediaUrl(image.id, pickWidth(image, 1200), 'webp')}`,
          ),
          breadcrumbJsonLd(env.siteUrl, [{ name: TITLE, path: '/etlap' }]),
        ]}
      />
    </>
  );
}
