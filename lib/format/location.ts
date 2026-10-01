import type { LocationSettings, OpeningDay } from '@/lib/content/settings-schema';

export const DAY_NAMES = [
  'Hétfő',
  'Kedd',
  'Szerda',
  'Csütörtök',
  'Péntek',
  'Szombat',
  'Vasárnap',
] as const;

/** schema.org day names, Monday first like the settings. */
export const SCHEMA_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Hungarian postal order: "3000 Hatvan, Kossuth tér 1." — or null when nothing is set. */
export function formatAddress(location: LocationSettings): string | null {
  const locality = [location.postalCode, location.city].filter(Boolean).join(' ');
  const parts = [locality, location.street].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Where "Útvonaltervezés" points: the configured directions link, or — if it was cleared — a
 * Google Maps route to the café's name and address, which is never empty.
 */
export function directionsHref(location: LocationSettings): string {
  if (location.directionsUrl) return location.directionsUrl;
  const destination = [location.name, location.street, location.postalCode, location.city]
    .filter(Boolean)
    .join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination || 'Kapucinus Kávézó Hatvan')}`;
}

/** Whether the café has entered a street address (a city alone does not count). */
export function hasStreetAddress(location: LocationSettings): boolean {
  return location.street.trim() !== '';
}

function isSet(day: OpeningDay): boolean {
  return day.closed || (day.open !== '' && day.close !== '');
}

/** "08:00" → "8:00": Hungarian timetables drop the leading zero of the hour. */
function formatTime(value: string): string {
  return value.replace(/^0(\d)/, '$1');
}

function describe(day: OpeningDay): string {
  return day.closed ? 'Zárva' : `${formatTime(day.open)}–${formatTime(day.close)}`;
}

export interface HoursRow {
  readonly days: string;
  readonly hours: string;
}

/**
 * Opening hours for display, consecutive days with the same hours merged ("Hétfő–Péntek").
 * Null until every day has been filled in, so a half-entered week is never published.
 */
export function publishedHours(location: LocationSettings): HoursRow[] | null {
  if (!location.hours.every(isSet)) return null;
  const rows: { from: number; to: number; hours: string }[] = [];
  location.hours.forEach((day, index) => {
    const hours = describe(day);
    const previous = rows.at(-1);
    if (previous && previous.hours === hours && previous.to === index - 1) previous.to = index;
    else rows.push({ from: index, to: index, hours });
  });
  return rows.map(({ from, to, hours }) => ({
    days: from === to ? DAY_NAMES[from]! : `${DAY_NAMES[from]}–${DAY_NAMES[to]}`,
    hours,
  }));
}
