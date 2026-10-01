import type { ReactNode } from 'react';
import { JsonLd } from '@/components/seo/json-ld';
import { PageIntro } from '@/components/site/page-intro';
import { env } from '@/lib/env';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

/** Hungarian long date: "2026. október 1." */
const LONG_DATE = new Intl.DateTimeFormat('hu-HU', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/**
 * The shared frame of the legal pages: quieter than the rest of the site — one column, a reading
 * measure, the effective date when set — but in the same type and color system.
 */
export function LegalLayout({
  title,
  path,
  effectiveDate,
  children,
}: {
  readonly title: string;
  readonly path: string;
  readonly effectiveDate: string;
  readonly children: ReactNode;
}) {
  return (
    <>
      <PageIntro crumb={title} title={title}>
        {effectiveDate ? (
          <p className="mt-6 text-small text-muted">
            Hatályos:{' '}
            <time dateTime={effectiveDate}>
              {LONG_DATE.format(new Date(`${effectiveDate}T00:00:00`))}
            </time>
          </p>
        ) : null}
      </PageIntro>
      <div className="shell pb-section">
        <div className="prose-k">{children}</div>
      </div>
      <JsonLd data={breadcrumbJsonLd(env.siteUrl, [{ name: title, path }])} />
    </>
  );
}
