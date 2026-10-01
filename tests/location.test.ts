import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/lib/content/settings-defaults';
import type { LocationSettings } from '@/lib/content/settings-schema';
import {
  directionsHref,
  formatAddress,
  hasStreetAddress,
  publishedHours,
} from '@/lib/format/location';

const base = DEFAULT_SETTINGS.location;
const week = (
  open: string,
  close: string,
  overrides: Record<number, LocationSettings['hours'][number]> = {},
) => Array.from({ length: 7 }, (_, day) => overrides[day] ?? { closed: false, open, close });

describe('publishedHours', () => {
  it('publishes nothing until every day is filled in', () => {
    expect(publishedHours(base)).toBeNull();
    const partial = week('08:00', '18:00', { 3: { closed: false, open: '', close: '' } });
    expect(publishedHours({ ...base, hours: partial })).toBeNull();
  });

  it('merges consecutive days with the same hours and drops the leading zero', () => {
    const hours = week('08:00', '18:00', {
      5: { closed: false, open: '09:00', close: '14:00' },
      6: { closed: true, open: '', close: '' },
    });
    expect(publishedHours({ ...base, hours })).toEqual([
      { days: 'Hétfő–Péntek', hours: '8:00–18:00' },
      { days: 'Szombat', hours: '9:00–14:00' },
      { days: 'Vasárnap', hours: 'Zárva' },
    ]);
  });
});

describe('formatAddress', () => {
  it('uses Hungarian postal order', () => {
    expect(
      formatAddress({ ...base, postalCode: '3000', city: 'Hatvan', street: 'Kossuth tér 1.' }),
    ).toBe('3000 Hatvan, Kossuth tér 1.');
  });

  it('returns the city alone, and null when nothing is set', () => {
    expect(formatAddress(base)).toBe('Hatvan');
    expect(formatAddress({ ...base, city: '' })).toBeNull();
    expect(hasStreetAddress(base)).toBe(false);
  });
});

describe('directionsHref', () => {
  it('prefers the configured link', () => {
    expect(directionsHref(base)).toBe(base.directionsUrl);
  });

  it('falls back to a route to the name and address, never an empty link', () => {
    const href = directionsHref({ ...base, directionsUrl: '', street: 'Fő utca 2.' });
    expect(href).toMatch(/^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
    expect(decodeURIComponent(href)).toContain('Kapucinus Kávézó, Fő utca 2., Hatvan');
  });
});
