import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ConsentProvider } from '@/components/consent/consent-provider';
import { ConsentWindow } from '@/components/consent/consent-window';
import { JsonLd } from '@/components/seo/json-ld';
import { IntroCurtain } from '@/components/site/intro-curtain';
import { MobileDock } from '@/components/site/mobile-dock';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { getMedia } from '@/lib/content/media';
import { directionsHref } from '@/lib/format/location';
import { getAllSettings, getSettings } from '@/lib/content/settings';
import { env } from '@/lib/env';
import { mediaUrl, ogImageUrl, pickWidth } from '@/lib/media/urls';
import { cafeJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { brandMark } from '@/lib/site/brand';
import { socialLinks } from '@/lib/site/social';
import { INTRO_SCRIPT } from '../head-script';

/**
 * Every public page reads the CMS at request time. SQLite answers in microseconds, and rendering
 * per request means an admin edit is live on the next load — no build-time snapshot of content
 * that may since have changed in the production database.
 */
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const site = getSettings('site');
  const icon = getMedia(site.iconId);
  return {
    title: { default: site.seoTitle, template: `%s – ${site.brandName}` },
    description: site.seoDescription,
    applicationName: site.brandName,
    ...(icon ? { icons: { icon: mediaUrl(icon.id, pickWidth(icon, 480), 'webp') } } : {}),
  };
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  const { site, location, social } = getAllSettings();
  const darkLogo = brandMark(site, 'dark');
  const lightLogo = brandMark(site, 'light');
  const shareImage = getMedia(site.ogImageId);

  const structuredData = [
    cafeJsonLd({
      siteUrl: env.siteUrl,
      site,
      location,
      sameAs: socialLinks(social).map((link) => link.url),
      logoUrl: new URL(darkLogo.src, env.siteUrl).toString(),
      imageUrl: shareImage ? new URL(ogImageUrl(shareImage.id), env.siteUrl).toString() : undefined,
    }),
    websiteJsonLd(env.siteUrl, site),
  ];

  return (
    <ConsentProvider>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <IntroCurtain logoSrc={lightLogo.src} />
      <a
        href="#main"
        className="sr-only z-[70] rounded bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ugrás a tartalomra
      </a>
      <SiteHeader logo={darkLogo} directionsUrl={directionsHref(location)} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter site={site} location={location} social={social} logo={lightLogo} />
      <MobileDock directionsUrl={directionsHref(location)} />
      <ConsentWindow />
      <JsonLd data={structuredData} />
    </ConsentProvider>
  );
}
