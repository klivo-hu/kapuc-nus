import { ArrowRight } from 'lucide-react';
import { preload } from 'react-dom';
import { ButtonLink } from '@/components/ui/button';
import type { SiteSettings } from '@/lib/content/settings-schema';
import type { HeroSlide } from '@/lib/content/types';
import { mediaUrl, pickWidth, srcSet } from '@/lib/media/urls';
import { HERO_IMAGE_SIZES, HeroCarousel } from './hero-carousel';
import { typeset } from '@/lib/format/typeset';

interface HeroProps {
  readonly slides: readonly HeroSlide[];
  readonly site: SiteSettings;
  readonly directionsUrl: string;
}

const LCP_TARGET_WIDTH = 1200;

/**
 * Chooses the hero: the admin's slides when there are any, otherwise a quiet brand hero built
 * from the café's own name and latte art — never an empty band at the top of the page.
 */
export function Hero({ slides, site, directionsUrl }: HeroProps) {
  const usable = slides.filter(
    (slide): slide is HeroSlide & { image: NonNullable<HeroSlide['image']> } =>
      Boolean(slide.image),
  );
  const first = usable[0]?.image;

  if (first) {
    // The first photograph is the page's largest paint: announce it in <head> so it is fetched
    // before the body is parsed. Later slides load behind it at normal priority.
    preload(mediaUrl(first.id, pickWidth(first, LCP_TARGET_WIDTH), 'avif'), {
      as: 'image',
      type: 'image/avif',
      imageSrcSet: srcSet(first, 'avif'),
      imageSizes: HERO_IMAGE_SIZES,
      fetchPriority: 'high',
    });
    return <HeroCarousel slides={usable} directionsUrl={directionsUrl} />;
  }

  return (
    <section
      aria-label="Bemutatkozás"
      className="shell grid min-h-[92svh] items-center gap-12 pb-16 pt-[calc(var(--cef-space-nav)+var(--cef-space-nav-offset)*2+3rem)] lg:grid-cols-12"
    >
      <div className="lg:col-span-6">
        <p className="font-serif text-display text-foreground">{site.brandName}</p>
        {site.tagline ? (
          <p className="mt-6 max-w-[36ch] text-lead text-muted">{typeset(site.tagline)}</p>
        ) : null}
        <div className="mt-9 flex flex-col gap-3 xs:flex-row">
          <ButtonLink href="/etlap" size="lg" icon={<ArrowRight className="size-4" />}>
            Étlap és itallap
          </ButtonLink>
          <ButtonLink href={directionsUrl} external variant="secondary" size="lg">
            Útvonaltervezés
          </ButtonLink>
        </div>
      </div>
      <picture className="mx-auto block w-full max-w-md lg:col-span-5 lg:col-start-8">
        <source
          type="image/avif"
          srcSet="/brand/latte-art-520.avif 520w, /brand/latte-art-1040.avif 1040w"
          sizes="28rem"
        />
        <img
          src="/brand/latte-art-1040.webp"
          width={1040}
          height={1040}
          alt=""
          className="h-auto w-full"
        />
      </picture>
    </section>
  );
}
