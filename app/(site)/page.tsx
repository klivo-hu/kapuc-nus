import type { Metadata } from 'next';
import { AboutSection } from '@/components/home/about-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { Hero } from '@/components/home/hero';
import { LocationSection } from '@/components/home/location-section';
import { SocialSection } from '@/components/home/social-section';
import { listActiveSlides } from '@/lib/content/hero';
import { getMedia } from '@/lib/content/media';
import { listFeaturedProducts } from '@/lib/content/menu';
import { getAllSettings, getSettings } from '@/lib/content/settings';
import { directionsHref } from '@/lib/format/location';
import { pageMetadata } from '@/lib/seo/metadata';
import { socialLinks } from '@/lib/site/social';

export function generateMetadata(): Metadata {
  const site = getSettings('site');
  return pageMetadata({ description: site.seoDescription, canonical: '/' });
}

export default function HomePage() {
  const { site, about, social, location } = getAllSettings();

  return (
    <>
      <h1 className="sr-only">{site.homeHeading}</h1>
      <Hero slides={listActiveSlides()} site={site} directionsUrl={directionsHref(location)} />
      <AboutSection
        about={about}
        primaryImage={getMedia(about.primaryImageId)}
        secondaryImage={getMedia(about.secondaryImageId)}
      />
      <FeaturedProducts products={listFeaturedProducts()} />
      <SocialSection links={socialLinks(social)} />
      <LocationSection location={location} />
    </>
  );
}
