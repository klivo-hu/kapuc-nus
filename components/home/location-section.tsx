import { ArrowUpRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import type { LocationSettings } from '@/lib/content/settings-schema';
import { directionsHref, formatAddress, publishedHours } from '@/lib/format/location';
import { MapEmbed } from './map-embed';
import { typeset } from '@/lib/format/typeset';

/**
 * Where to find the café: address, hours, the way here, and the map. Only what the café has
 * entered is shown — a missing address or unpublished week is left out rather than stubbed.
 */
export function LocationSection({ location }: { readonly location: LocationSettings }) {
  const address = formatAddress(location);
  const hours = publishedHours(location);

  return (
    <section id="helyszin" aria-labelledby="helyszin-cim" className="shell py-section">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 id="helyszin-cim" className="text-h1 text-foreground">
            Itt találsz meg
          </h2>
          {address ? (
            <address className="mt-6 text-lead not-italic text-foreground">
              {location.name ? <span className="block">{location.name}</span> : null}
              {address}
            </address>
          ) : null}

          {hours ? (
            <div className="mt-10">
              <h3 className="font-sans text-small font-medium text-muted">Nyitvatartás</h3>
              <dl className="mt-3 divide-y divide-border border-y border-border">
                {hours.map((row) => (
                  <div key={row.days} className="flex justify-between gap-6 py-3">
                    <dt className="text-foreground">{row.days}</dt>
                    <dd className="tabular text-foreground">{row.hours}</dd>
                  </div>
                ))}
              </dl>
              {location.hoursNote ? (
                <p className="mt-3 text-small text-muted">{typeset(location.hoursNote)}</p>
              ) : null}
            </div>
          ) : null}

          {location.phone || location.email ? (
            <p className="mt-8 flex flex-col gap-1 text-foreground">
              {location.phone ? (
                <a
                  href={`tel:${location.phone.replace(/\s+/g, '')}`}
                  className="link-draw self-start"
                >
                  {location.phone}
                </a>
              ) : null}
              {location.email ? (
                <a href={`mailto:${location.email}`} className="link-draw self-start">
                  {location.email}
                </a>
              ) : null}
            </p>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 xs:flex-row">
            <ButtonLink
              href={directionsHref(location)}
              external
              size="lg"
              icon={<ArrowUpRight className="size-4" />}
            >
              Útvonaltervezés
            </ButtonLink>
            {location.mapsUrl ? (
              <ButtonLink href={location.mapsUrl} external variant="secondary" size="lg">
                Megnyitás a Térképen
              </ButtonLink>
            ) : null}
          </div>
        </div>

        {location.mapEmbedUrl ? (
          <div className="lg:col-span-7">
            <MapEmbed
              src={location.mapEmbedUrl}
              title={`${location.name || 'A kávézó'} a Google Térképen`}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
