'use server';

import { redirect } from 'next/navigation';
import { z } from '@/lib/validation/zod-hu';
import { checkbox, optionalId, text } from '@/lib/admin/form-data';
import { errorState, successState, validationState, type FormState } from '@/lib/admin/form-state';
import { revalidateSite } from '@/lib/admin/revalidate';
import { galleryItemSchema } from '@/lib/admin/schemas';
import { requireAdmin } from '@/lib/auth/guard';
import {
  createGalleryCategory,
  createGalleryItem,
  deleteGalleryCategory,
  deleteGalleryItem,
  getGalleryItem,
  renameGalleryCategory,
  setGalleryItemActive,
  updateGalleryItem,
} from '@/lib/content/gallery';
import { deleteMediaIfUnused, getMedia } from '@/lib/content/media';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Add meg a kategória nevét.').max(40, 'Legfeljebb 40 karakter.'),
});

/**
 * Registers a freshly uploaded image as a gallery item. It starts unpublished: a photograph
 * goes live only once someone has described it (alt text) and switched it on.
 */
export async function addGalleryItemAction(
  mediaId: string,
  title: string,
): Promise<{ id: number } | { error: string }> {
  await requireAdmin();
  if (!getMedia(mediaId)) return { error: 'A kép nem található.' };
  const id = createGalleryItem(mediaId, {
    title: title.trim().slice(0, 120),
    alt: '',
    description: '',
    categoryId: null,
    isActive: false,
  });
  revalidateSite();
  return { id };
}

export async function saveGalleryItemAction(
  id: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (!getGalleryItem(id)) return errorState('Ez a kép már nem létezik.');
  const parsed = galleryItemSchema.safeParse({
    title: text(formData, 'title'),
    alt: text(formData, 'alt'),
    description: text(formData, 'description'),
    categoryId: optionalId(formData, 'categoryId'),
    isActive: checkbox(formData, 'isActive'),
  });
  if (!parsed.success) return validationState(parsed.error, formData);
  updateGalleryItem(id, parsed.data);
  revalidateSite();
  return successState(
    parsed.data.isActive ? 'Mentve, a kép látszik a galériában.' : 'Mentve. A kép rejtett.',
  );
}

export async function toggleGalleryItemAction(id: number, isActive: boolean): Promise<void> {
  await requireAdmin();
  const item = getGalleryItem(id);
  if (!item) return;
  // Publishing requires a description of the image; send the admin to write one first.
  if (isActive && item.alt.trim().length < 3) redirect(`/admin/galeria/${id}?alt-hianyzik=1`);
  setGalleryItemActive(id, isActive);
  revalidateSite();
}

export async function deleteGalleryItemAction(id: number): Promise<void> {
  await requireAdmin();
  deleteMediaIfUnused(deleteGalleryItem(id));
  revalidateSite();
  redirect('/admin/galeria');
}

export async function createGalleryCategoryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({ name: text(formData, 'name') });
  if (!parsed.success) return validationState(parsed.error, formData);
  createGalleryCategory(parsed.data.name);
  revalidateSite();
  return successState('A kategória elkészült.', {});
}

export async function renameGalleryCategoryAction(
  id: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({ name: text(formData, 'name') });
  if (!parsed.success) return validationState(parsed.error, formData);
  renameGalleryCategory(id, parsed.data.name);
  revalidateSite();
  return successState('Átnevezve.');
}

export async function deleteGalleryCategoryAction(id: number): Promise<void> {
  await requireAdmin();
  deleteGalleryCategory(id);
  revalidateSite();
}
