import { z } from '@/lib/validation/zod-hu';
import { DIETARY_TAGS } from '@/lib/content/types';

/** Validation for admin-edited content. Messages are Hungarian: they are shown in the form. */

const required = (label: string, max: number) =>
  z.string().trim().min(1, `Add meg: ${label}.`).max(max, `Legfeljebb ${max} karakter lehet.`);
const optional = (max: number) => z.string().trim().max(max, `Legfeljebb ${max} karakter lehet.`);
const mediaId = z
  .string()
  .regex(/^[a-z0-9-]{4,64}$/)
  .nullable();

export const slideSchema = z.object({
  title: required('a címet', 120),
  description: optional(400),
  note: optional(40),
  mediaId,
  imageAlt: optional(200),
  isActive: z.boolean(),
});

export const categorySchema = z.object({
  name: required('a kategória nevét', 60),
  description: optional(300),
  isActive: z.boolean(),
});

export const productSchema = z.object({
  categoryId: z
    .number({ invalid_type_error: 'Válassz kategóriát.' })
    .int()
    .positive('Válassz kategóriát.'),
  name: required('a termék nevét', 120),
  description: optional(500),
  price: z
    .number({ invalid_type_error: 'Az árat egész forintban add meg.' })
    .int()
    .min(0)
    .max(1_000_000, 'Ez túl magas ár.')
    .nullable(),
  priceNote: optional(24),
  mediaId,
  allergens: optional(200),
  dietary: z.array(z.enum(DIETARY_TAGS)),
  isFeatured: z.boolean(),
  isAvailable: z.boolean(),
});

export const galleryItemSchema = z
  .object({
    title: optional(120),
    alt: optional(200),
    description: optional(400),
    categoryId: z.number().int().positive().nullable(),
    isActive: z.boolean(),
  })
  .refine((item) => !item.isActive || item.alt.length >= 3, {
    path: ['alt'],
    message: 'Közzététel előtt írd le, mi látható a képen (alt szöveg).',
  });
