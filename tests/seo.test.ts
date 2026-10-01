import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/content/settings-defaults';
import { parseSettings } from '@/lib/content/settings-schema';
import type { MenuSection, Product } from '@/lib/content/types';
import { breadcrumbJsonLd, cafeJsonLd, menuJsonLd, serializeJsonLd } from '@/lib/seo/jsonld';

const SITE = 'https://kavezo.example';

describe('cafeJsonLd', () => {
  it('describes the café without inventing what is not set', () => {
    const data = cafeJsonLd({
      siteUrl: SITE,
      site: DEFAULT_SETTINGS.site,
      location: DEFAULT_SETTINGS.location,
      sameAs: [],
      logoUrl: `${SITE}/brand/logo.png`,
    });
    expect(data['@type']).toBe('CafeOrCoffeeShop');
    expect(data.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Hatvan',
      addressCountry: 'HU',
    });
    for (const absent of [
      'telephone',
      'email',
      'geo',
      'openingHoursSpecification',
      'sameAs',
      'priceRange',
    ]) {
      expect(data).not.toHaveProperty(absent);
    }
  });

  it('publishes opening hours once the week is complete, skipping closed days', () => {
    const hours = Array.from({ length: 7 }, (_, day) =>
      day === 6
        ? { closed: true, open: '', close: '' }
        : { closed: false, open: '08:00', close: '18:00' },
    );
    const data = cafeJsonLd({
      siteUrl: SITE,
      site: DEFAULT_SETTINGS.site,
      location: { ...DEFAULT_SETTINGS.location, hours },
      sameAs: [],
      logoUrl: `${SITE}/brand/logo.png`,
    });
    const spec = data.openingHoursSpecification as { dayOfWeek: string }[];
    expect(spec).toHaveLength(6);
    expect(spec[0]).toMatchObject({
      dayOfWeek: 'https://schema.org/Monday',
      opens: '08:00',
      closes: '18:00',
    });
  });
});

describe('menuJsonLd', () => {
  const product = (overrides: Partial<Product>): Product => ({
    id: 1,
    categoryId: 1,
    name: 'Latte',
    description: '',
    price: null,
    priceNote: '',
    image: null,
    allergens: '',
    dietary: [],
    isFeatured: false,
    featuredOrder: 0,
    isAvailable: true,
    sortOrder: 0,
    ...overrides,
  });
  const section: MenuSection = {
    id: 1,
    name: 'Kávék',
    slug: 'kavek',
    description: '',
    sortOrder: 0,
    isActive: true,
    products: [
      product({}),
      product({ id: 2, name: 'Vegán torta', price: 1290, dietary: ['vegan', 'sugar-free'] }),
    ],
  };

  it('offers a price only where one is published', () => {
    const menu = menuJsonLd(SITE, [section], () => '');
    const items = (menu.hasMenuSection as { hasMenuItem: Record<string, unknown>[] }[])[0]!
      .hasMenuItem;
    expect(items[0]).not.toHaveProperty('offers');
    expect(items[1]!.offers).toMatchObject({ price: 1290, priceCurrency: 'HUF' });
    expect(items[1]!.suitableForDiet).toEqual(['https://schema.org/VeganDiet']);
  });
});

describe('breadcrumbJsonLd', () => {
  it('starts at the home page', () => {
    const data = breadcrumbJsonLd(SITE, [{ name: 'Galéria', path: '/galeria' }]);
    expect(data.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Főoldal', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Galéria', item: `${SITE}/galeria` },
    ]);
  });
});

describe('serializeJsonLd', () => {
  it('cannot be closed from inside by a stored value', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain(
      '</script>',
    );
  });
});

describe('parseSettings', () => {
  it('falls back to the defaults when a stored row is malformed', () => {
    expect(parseSettings('social', { instagram: 42 })).toEqual(DEFAULT_SETTINGS.social);
    expect(parseSettings('location', undefined)).toEqual(DEFAULT_SETTINGS.location);
  });

  it('normalizes a pasted iframe into the embed URL, and refuses other hosts', () => {
    const embed = 'https://www.google.com/maps/embed?pb=abc';
    const accepted = parseSettings('location', {
      ...DEFAULT_SETTINGS.location,
      mapEmbedUrl: `<iframe src="${embed}"></iframe>`,
    });
    expect(accepted.mapEmbedUrl).toBe(embed);
    const refused = parseSettings('location', {
      ...DEFAULT_SETTINGS.location,
      mapEmbedUrl: 'https://evil.example/x',
    });
    expect(refused).toEqual(DEFAULT_SETTINGS.location);
  });
});
