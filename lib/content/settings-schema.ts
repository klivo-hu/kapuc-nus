import { z } from '@/lib/validation/zod-hu';
import { isHttpUrl, parseMapEmbed } from '@/lib/validation/urls';
import { DEFAULT_SETTINGS } from './settings-defaults';

/**
 * The shape of every editable settings group. Each group is stored as one JSON row, validated on
 * write (admin forms) and on read (a malformed row falls back to its default instead of breaking
 * the page).
 */

const text = (max: number) => z.string().trim().max(max);
const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => value === '' || isHttpUrl(value), 'Érvényes http(s) címet adj meg.');
const mediaId = z
  .string()
  .regex(/^[a-z0-9-]{4,64}$/)
  .nullable();
const timeOfDay = z
  .string()
  .regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'Az időt ÓÓ:PP formában add meg.');

export const siteSchema = z.object({
  brandName: text(80).min(1, 'Add meg a nevet.'),
  tagline: text(200),
  homeHeading: text(120).min(1),
  seoTitle: text(70).min(1, 'Add meg az oldal címét.'),
  seoDescription: text(170).min(1, 'Add meg a leírást.'),
  ogImageId: mediaId,
  logoId: mediaId,
  iconId: mediaId,
});

export const aboutSchema = z.object({
  heading: text(120).min(1),
  lead: text(400),
  body: text(1500),
  note: text(40),
  primaryImageId: mediaId,
  primaryImageAlt: text(200),
  secondaryImageId: mediaId,
  secondaryImageAlt: text(200),
});

const valueItem = z.object({ title: text(80).min(1), text: text(400) });
const altImage = z.object({ id: mediaId, alt: text(200) });

export const aboutPageSchema = z.object({
  heading: text(120).min(1),
  lead: text(400),
  heroImage: altImage,
  storyHeading: text(120),
  storyBody: text(4000),
  valuesHeading: text(120),
  values: z.array(valueItem).max(6),
  atmosphereHeading: text(120),
  atmosphereBody: text(1500),
  atmosphereImages: z.array(altImage).max(4),
  teamHeading: text(120),
  teamBody: text(1500),
  teamImage: altImage,
  closingNote: text(40),
});

export const socialSchema = z.object({
  instagram: optionalUrl,
  facebook: optionalUrl,
  tiktok: optionalUrl,
  others: z
    .array(z.object({ label: text(40).min(1), url: optionalUrl.refine((v) => v !== '') }))
    .max(6),
});

export const openingDaySchema = z.object({
  closed: z.boolean(),
  open: timeOfDay,
  close: timeOfDay,
});

export const locationSchema = z.object({
  name: text(120),
  street: text(160),
  postalCode: text(12),
  city: text(80),
  mapEmbedUrl: z
    .string()
    .trim()
    .max(4000)
    .transform((value) => (value === '' ? '' : (parseMapEmbed(value) ?? '\u0000')))
    .refine((value) => value !== '\u0000', 'Ez nem Google Térkép beágyazási cím.'),
  directionsUrl: optionalUrl,
  mapsUrl: optionalUrl,
  phone: text(40),
  email: z.union([z.literal(''), z.string().trim().email('Érvényes e-mail címet adj meg.')]),
  /** Monday first, seven entries. A day with neither times nor `closed` is simply not published. */
  hours: z.array(openingDaySchema).length(7),
  hoursNote: text(200),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

export const operatorSchema = z.object({
  companyName: text(160),
  seat: text(200),
  registrationNumber: text(60),
  taxNumber: text(40),
  email: z.union([z.literal(''), z.string().trim().email('Érvényes e-mail címet adj meg.')]),
  phone: text(40),
  hostingProvider: text(160),
  hostingAddress: text(200),
  hostingContact: text(160),
});

export const legalSchema = z.object({
  privacy: text(40000),
  cookies: text(40000),
  impressumNote: text(8000),
  effectiveDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
});

export const SETTINGS_SCHEMAS = {
  site: siteSchema,
  about: aboutSchema,
  aboutPage: aboutPageSchema,
  social: socialSchema,
  location: locationSchema,
  operator: operatorSchema,
  legal: legalSchema,
} as const;

export type SettingsKey = keyof typeof SETTINGS_SCHEMAS;
export type Settings = { [K in SettingsKey]: z.output<(typeof SETTINGS_SCHEMAS)[K]> };
export type SiteSettings = Settings['site'];
export type AboutSettings = Settings['about'];
export type AboutPageSettings = Settings['aboutPage'];
export type SocialSettings = Settings['social'];
export type LocationSettings = Settings['location'];
export type OpeningDay = z.output<typeof openingDaySchema>;
export type OperatorSettings = Settings['operator'];
export type LegalSettings = Settings['legal'];

/** Parses a stored settings row; anything malformed yields the default for that group. */
export function parseSettings<K extends SettingsKey>(key: K, raw: unknown): Settings[K] {
  const parsed = SETTINGS_SCHEMAS[key].safeParse(raw);
  return parsed.success ? (parsed.data as Settings[K]) : DEFAULT_SETTINGS[key];
}
