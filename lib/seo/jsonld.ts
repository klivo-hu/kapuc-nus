import type { LocationSettings, SiteSettings } from '@/lib/content/settings-schema';
import type { DietaryTag, ImageAsset, MenuSection } from '@/lib/content/types';
import { SCHEMA_DAYS } from '@/lib/format/location';

/**
 * schema.org structured data, built only from what the site actually shows. A field the café has
 * not filled in (street, phone, hours, coordinates) is omitted rather than guessed, so the
 * markup never claims more than the visible page.
 */

type JsonLd = Record<string, unknown>;

const compact = <T extends JsonLd>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(
      ([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
    ),
  ) as T;

export const cafeId = (siteUrl: string) => `${siteUrl}/#cafe`;
export const websiteId = (siteUrl: string) => `${siteUrl}/#website`;

export interface CafeInput {
  readonly siteUrl: string;
  readonly site: SiteSettings;
  readonly location: LocationSettings;
  readonly sameAs: readonly string[];
  readonly logoUrl: string;
  readonly imageUrl?: string;
}

export function cafeJsonLd({
  siteUrl,
  site,
  location,
  sameAs,
  logoUrl,
  imageUrl,
}: CafeInput): JsonLd {
  const hasAddress = location.street !== '' || location.postalCode !== '' || location.city !== '';
  const openingHours = location.hours.every((day) => day.closed || (day.open && day.close))
    ? location.hours
        .map((day, index) =>
          day.closed
            ? null
            : {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: `https://schema.org/${SCHEMA_DAYS[index]}`,
                opens: day.open,
                closes: day.close,
              },
        )
        .filter((entry) => entry !== null)
    : [];

  return compact({
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    '@id': cafeId(siteUrl),
    name: site.brandName,
    description: site.seoDescription,
    url: `${siteUrl}/`,
    logo: logoUrl,
    image: imageUrl,
    servesCuisine: ['Kávé', 'Sütemények', 'Torták'],
    hasMenu: `${siteUrl}/etlap`,
    address: hasAddress
      ? compact({
          '@type': 'PostalAddress',
          streetAddress: location.street,
          postalCode: location.postalCode,
          addressLocality: location.city,
          addressCountry: 'HU',
        })
      : undefined,
    geo:
      location.latitude !== null && location.longitude !== null
        ? { '@type': 'GeoCoordinates', latitude: location.latitude, longitude: location.longitude }
        : undefined,
    telephone: location.phone,
    email: location.email,
    hasMap: location.mapsUrl,
    openingHoursSpecification: openingHours,
    sameAs: [...sameAs],
  });
}

export function websiteJsonLd(siteUrl: string, site: SiteSettings): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId(siteUrl),
    url: `${siteUrl}/`,
    name: site.brandName,
    inLanguage: 'hu-HU',
    publisher: { '@id': cafeId(siteUrl) },
  };
}

export function breadcrumbJsonLd(
  siteUrl: string,
  trail: readonly { name: string; path: string }[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Főoldal', path: '/' }, ...trail].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path === '/' ? '/' : crumb.path}`,
    })),
  };
}

const DIET_URLS: Partial<Record<DietaryTag, string>> = {
  vegan: 'https://schema.org/VeganDiet',
  vegetarian: 'https://schema.org/VegetarianDiet',
  'gluten-free': 'https://schema.org/GlutenFreeDiet',
  'lactose-free': 'https://schema.org/LowLactoseDiet',
};

/**
 * The menu as schema.org Menu → MenuSection → MenuItem. A café's offering is a menu, not a
 * product catalogue, so MenuItem is the accurate type; an item carries an Offer only when the
 * café has published its price.
 */
export function menuJsonLd(
  siteUrl: string,
  sections: readonly MenuSection[],
  imageUrl: (image: ImageAsset) => string,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${siteUrl}/etlap#menu`,
    name: 'Étlap és itallap',
    inLanguage: 'hu-HU',
    url: `${siteUrl}/etlap`,
    hasMenuSection: sections.map((section) =>
      compact({
        '@type': 'MenuSection',
        name: section.name,
        description: section.description,
        hasMenuItem: section.products.map((product) => {
          const diets = product.dietary
            .map((tag) => DIET_URLS[tag])
            .filter((url): url is string => Boolean(url));
          return compact({
            '@type': 'MenuItem',
            name: product.name,
            description: product.description,
            image: product.image ? imageUrl(product.image) : undefined,
            suitableForDiet: diets,
            offers:
              product.price !== null
                ? {
                    '@type': 'Offer',
                    price: product.price,
                    priceCurrency: 'HUF',
                    availability: product.isAvailable
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/OutOfStock',
                  }
                : undefined,
          });
        }),
      }),
    ),
  };
}

/** Serializes for a <script type="application/ld+json">, escaping `<` so no value can close it. */
export function serializeJsonLd(data: JsonLd | readonly JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
