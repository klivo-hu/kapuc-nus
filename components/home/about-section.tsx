import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Picture } from '@/components/media/picture';
import { RevealImage } from '@/components/motion/reveal-image';
import type { AboutSettings } from '@/lib/content/settings-schema';
import type { ImageAsset } from '@/lib/content/types';
import { typeset } from '@/lib/format/typeset';

interface AboutSectionProps {
  readonly about: AboutSettings;
  readonly primaryImage: ImageAsset | null;
  readonly secondaryImage: ImageAsset | null;
}

/**
 * "Rólunk" on the home page, set like a magazine spread rather than image-left/card-right: a
 * large statement across the top, a tall photograph anchoring the left, and on the right the
 * lead, a smaller second photograph, and the body text stepped down beside it.
 */
export function AboutSection({ about, primaryImage, secondaryImage }: AboutSectionProps) {
  return (
    <section aria-labelledby="rolunk-cim" className="shell py-section">
      <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-16">
        <h2 id="rolunk-cim" className="text-h1 text-foreground lg:col-span-8 lg:row-start-1">
          {typeset(about.heading)}
        </h2>

        {primaryImage ? (
          <figure className="relative lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-2">
            <RevealImage className="aspect-[4/5] rounded-xl">
              <Picture
                image={primaryImage}
                alt={about.primaryImageAlt}
                sizes="(min-width: 1024px) 38vw, (min-width: 640px) 80vw, 92vw"
              />
            </RevealImage>
            {/* Set below the photograph, never over it or into the next column. */}
            {about.note ? (
              <figcaption
                aria-hidden
                className="mt-4 -rotate-2 pr-2 text-right font-script text-script leading-tight text-mocha-700"
              >
                {typeset(about.note)}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <p className="text-lead text-foreground lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:self-start lg:pt-6">
          {typeset(about.lead)}
        </p>

        <div className="grid gap-8 sm:grid-cols-2 sm:items-end lg:col-span-6 lg:col-start-7 lg:row-start-3 lg:gap-10 lg:self-end">
          {secondaryImage ? (
            <RevealImage className="aspect-[4/5] rounded-lg">
              <Picture
                image={secondaryImage}
                alt={about.secondaryImageAlt}
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 44vw, 92vw"
              />
            </RevealImage>
          ) : null}
          <div>
            {about.body ? <p className="text-body text-muted">{typeset(about.body)}</p> : null}
            <Link
              href="/rolunk"
              className="group mt-7 inline-flex items-center gap-2 font-medium text-foreground"
            >
              <span className="link-draw">A Kapucinusról bővebben</span>
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-normal ease-out group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
