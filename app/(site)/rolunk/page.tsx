import type { Metadata } from 'next';
import { Picture } from '@/components/media/picture';
import { RevealImage } from '@/components/motion/reveal-image';
import { JsonLd } from '@/components/seo/json-ld';
import { PageIntro } from '@/components/site/page-intro';
import { VisitBand } from '@/components/site/visit-band';
import { CoffeeEdge } from '@/components/site/coffee-edge';
import { cn } from '@/lib/cn';
import { getMedia } from '@/lib/content/media';
import { getSettings } from '@/lib/content/settings';
import { env } from '@/lib/env';
import { directionsHref } from '@/lib/format/location';
import { paragraphs } from '@/lib/format/text';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import { typeset } from '@/lib/format/typeset';

export function generateMetadata(): Metadata {
  const page = getSettings('aboutPage');
  return pageMetadata({
    title: page.heading,
    description: page.lead || 'A Kapucinus Kávézó története, csapata és hangulata.',
    canonical: '/rolunk',
    imageId: page.heroImage.id,
  });
}

export default function AboutPage() {
  const page = getSettings('aboutPage');
  const location = getSettings('location');
  const hero = getMedia(page.heroImage.id);
  const team = getMedia(page.teamImage.id);
  const atmosphere = page.atmosphereImages
    .map((entry) => ({ image: getMedia(entry.id), alt: entry.alt }))
    .filter(
      (entry): entry is { image: NonNullable<typeof entry.image>; alt: string } =>
        entry.image !== null,
    );
  const [firstParagraph, ...restParagraphs] = paragraphs(page.storyBody);

  return (
    <>
      <PageIntro crumb={page.heading} title={page.heading} lead={page.lead} />

      {hero ? (
        <div className="shell">
          <RevealImage className="aspect-[4/3] rounded-xl sm:aspect-[16/9] lg:aspect-[21/9] lg:rounded-2xl">
            <Picture
              image={hero}
              alt={page.heroImage.alt}
              sizes="(min-width: 1344px) 84rem, 100vw"
              priority
            />
          </RevealImage>
        </div>
      ) : null}

      {page.storyHeading || firstParagraph ? (
        <section aria-labelledby="tortenet-cim" className="shell py-section">
          <div className="grid gap-10 lg:grid-cols-12">
            <h2 id="tortenet-cim" className="text-h1 text-foreground lg:col-span-4">
              {typeset(page.storyHeading)}
            </h2>
            <div className="space-y-6 lg:col-span-7 lg:col-start-6">
              {firstParagraph ? (
                <p className="max-w-[58ch] text-lead text-foreground">{typeset(firstParagraph)}</p>
              ) : null}
              {restParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="max-w-[62ch] text-body text-muted">
                  {typeset(paragraph)}
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.values.length > 0 ? (
        <section aria-labelledby="ertekek-cim" className="relative z-10">
          {/* The rising coffee may reach into the story's bottom padding, but never into the photo. */}
          <CoffeeEdge
            pour="a"
            side="top"
            flipX
            className={page.storyHeading || firstParagraph ? '-mt-[5vw]' : 'mt-section-tight'}
          />
          <div className="surface-dark bg-espresso-800 text-cream-100">
            <div className="shell py-section-tight">
              <h2 id="ertekek-cim" className="text-h2 text-cream-50">
                {typeset(page.valuesHeading)}
              </h2>
              <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
                {page.values.map((value, index) => (
                  <li
                    key={value.title}
                    className={cn(
                      'md:px-8',
                      index === 0 ? 'md:pl-0' : 'md:border-l md:border-cream-50/15',
                    )}
                  >
                    <h3 className="text-h3 text-cream-50">{typeset(value.title)}</h3>
                    <p className="mt-3 max-w-[38ch] text-body text-cream-200">
                      {typeset(value.text)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <CoffeeEdge pour="b" side="bottom" className="-mb-[5vw]" />
        </section>
      ) : null}

      {atmosphere.length > 0 || page.atmosphereHeading ? (
        <section aria-labelledby="hangulat-cim" className="shell py-section">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 id="hangulat-cim" className="text-h1 text-foreground lg:col-span-5">
              {typeset(page.atmosphereHeading)}
            </h2>
            {page.atmosphereBody ? (
              <p className="max-w-[48ch] text-lead text-muted lg:col-span-5 lg:col-start-8 lg:self-end">
                {typeset(page.atmosphereBody)}
              </p>
            ) : null}
          </div>
          {atmosphere.length > 0 ? (
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
              {atmosphere.map((entry, index) => (
                <RevealImage
                  key={entry.image.id}
                  className={cn(
                    'rounded-xl',
                    index === 0
                      ? 'aspect-[4/5] sm:col-span-2 lg:col-span-7 lg:row-span-2 lg:aspect-auto lg:min-h-[36rem]'
                      : 'aspect-[4/3] lg:col-span-5',
                  )}
                >
                  <Picture
                    image={entry.image}
                    alt={entry.alt}
                    sizes={
                      index === 0
                        ? '(min-width: 1024px) 50vw, 100vw'
                        : '(min-width: 1024px) 35vw, (min-width: 640px) 50vw, 100vw'
                    }
                  />
                </RevealImage>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {page.teamHeading || team ? (
        <section aria-labelledby="csapat-cim" className="shell pb-section">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {team ? (
              <RevealImage className="aspect-[4/5] rounded-xl lg:col-span-5">
                <Picture
                  image={team}
                  alt={page.teamImage.alt}
                  sizes="(min-width: 1024px) 38vw, 100vw"
                />
              </RevealImage>
            ) : null}
            <div className="lg:col-span-5 lg:col-start-7">
              <h2 id="csapat-cim" className="text-h1 text-foreground">
                {typeset(page.teamHeading)}
              </h2>
              {paragraphs(page.teamBody).map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="mt-6 max-w-[46ch] text-lead text-muted">
                  {typeset(paragraph)}
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <VisitBand directionsUrl={directionsHref(location)} note={page.closingNote} />
      <JsonLd data={breadcrumbJsonLd(env.siteUrl, [{ name: page.heading, path: '/rolunk' }])} />
    </>
  );
}
