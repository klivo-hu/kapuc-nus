'use client';

import { MapPin } from 'lucide-react';
import { ConsentGate } from '@/components/consent/consent-gate';
import { useConsent } from '@/components/consent/consent-provider';
import { Button } from '@/components/ui/button';

const MAP_CATEGORY = 'functional';

/**
 * The Google Maps embed, behind consent. Google may set cookies when the map loads, so nothing
 * is requested from Google until the visitor has allowed external content — either in the consent
 * window or with the button here, which records the same decision. The directions link beside
 * the map works either way.
 */
export function MapEmbed({ src, title }: { readonly src: string; readonly title: string }) {
  const { ready, allows, grants, save } = useConsent();
  const allowed = ready && allows(MAP_CATEGORY);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream-200 sm:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[28rem]">
      <ConsentGate category={MAP_CATEGORY}>
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </ConsentGate>
      {allowed ? null : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
          <MapPin aria-hidden className="size-8 text-forest-700" strokeWidth={1.5} />
          <p className="max-w-[34ch] text-small text-espresso-800">
            A térképet a Google szolgáltatja, és betöltéskor sütiket helyezhet el. Ha szeretnéd
            látni, engedélyezd a külső tartalmat.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => save({ ...grants, [MAP_CATEGORY]: true })}
          >
            Térkép betöltése
          </Button>
        </div>
      )}
    </div>
  );
}
