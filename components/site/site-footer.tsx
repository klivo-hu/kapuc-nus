import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ConsentSettingsButton } from '@/components/consent/consent-settings-button';
import type { LocationSettings, SiteSettings, SocialSettings } from '@/lib/content/settings-schema';
import { formatAddress, publishedHours } from '@/lib/format/location';
import type { BrandMark } from '@/lib/site/brand';
import { LEGAL_NAV, PRIMARY_NAV } from '@/lib/site/navigation';
import { socialLinks } from '@/lib/site/social';
import { typeset } from '@/lib/format/typeset';

interface SiteFooterProps {
  readonly site: SiteSettings;
  readonly location: LocationSettings;
  readonly social: SocialSettings;
  readonly logo: BrandMark;
}

// On the grey-green, cream-200 is the quietest text that still clears AA (5.1:1).
const columnTitle = 'text-small font-medium text-cream-200';
const footerLink =
  'link-draw inline-flex min-h-6 items-center text-cream-100 transition-colors hover:text-cream-50';

/**
 * The footer, on the café's grey-green: the brand and its one-line promise, then three short
 * columns — where to go, how to get here, where to follow. Any column with nothing to say is left out, so an unset address or
 * social account never shows as an empty heading.
 */
export function SiteFooter({ site, location, social, logo }: SiteFooterProps) {
  const address = formatAddress(location);
  const hours = publishedHours(location);
  const socials = socialLinks(social);
  const year = new Date().getFullYear();

  return (
    <footer className="surface-dark relative mt-[clamp(3rem,6vw,5rem)] bg-forest-600 pb-28 text-cream-100 lg:pb-0">
      <div className="shell pb-10 pt-16 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <img
              src={logo.src}
              width={logo.width}
              height={logo.height}
              alt={logo.alt}
              className="h-11 w-auto"
            />
            {site.tagline ? (
              <p className="mt-6 max-w-xs text-lead text-cream-100">{typeset(site.tagline)}</p>
            ) : null}
          </div>

          <nav aria-label="Lábléc" className="lg:col-span-2 lg:col-start-6">
            <h2 className={columnTitle}>Oldalak</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/" className={footerLink}>
                  Főoldal
                </Link>
              </li>
              {PRIMARY_NAV.filter((link) => !link.href.includes('#')).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={columnTitle}>Látogass el</h2>
            <address className="mt-4 space-y-2.5 not-italic">
              {address ? <p>{address}</p> : null}
              {location.phone ? (
                <p>
                  <a href={`tel:${location.phone.replace(/\s+/g, '')}`} className={footerLink}>
                    {location.phone}
                  </a>
                </p>
              ) : null}
              {location.email ? (
                <p>
                  <a href={`mailto:${location.email}`} className={footerLink}>
                    {location.email}
                  </a>
                </p>
              ) : null}
            </address>
            {hours ? (
              <dl className="mt-5 space-y-1 text-small">
                {hours.map((row) => (
                  <div key={row.days} className="flex justify-between gap-6">
                    <dt className="text-cream-200">{row.days}</dt>
                    <dd className="tabular">{row.hours}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {location.directionsUrl ? (
              <a
                href={location.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-1.5 font-medium text-cream-50"
              >
                <span className="link-draw">Útvonaltervezés</span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-normal group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
                <span className="sr-only"> (új lapon nyílik meg)</span>
              </a>
            ) : null}
          </div>

          {socials.length > 0 ? (
            <div className="lg:col-span-2">
              <h2 className={columnTitle}>Kövess minket</h2>
              <ul className="mt-4 space-y-2.5">
                {socials.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={footerLink}
                    >
                      {link.label}
                      <span className="sr-only"> (új lapon nyílik meg)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-cream-50/15 pt-6 text-meta text-cream-200 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.brandName}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-draw inline-flex min-h-6 items-center hover:text-cream-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <ConsentSettingsButton className="link-draw inline-flex min-h-6 items-center hover:text-cream-50" />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
