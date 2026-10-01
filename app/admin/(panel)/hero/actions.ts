'use server';

import { redirect } from 'next/navigation';
import { checkbox, mediaIdField, text } from '@/lib/admin/form-data';
import { successState, validationState, type FormState } from '@/lib/admin/form-state';
import { revalidateSite } from '@/lib/admin/revalidate';
import { slideSchema } from '@/lib/admin/schemas';
import { requireAdmin } from '@/lib/auth/guard';
import {
  createSlide,
  deleteSlide,
  getSlide,
  setSlideActive,
  updateSlide,
} from '@/lib/content/hero';
import { deleteMediaIfUnused } from '@/lib/content/media';

export async function saveSlideAction(
  id: number | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = slideSchema.safeParse({
    title: text(formData, 'title'),
    description: text(formData, 'description'),
    note: text(formData, 'note'),
    mediaId: mediaIdField(formData, 'mediaId'),
    imageAlt: text(formData, 'imageAlt'),
    isActive: checkbox(formData, 'isActive'),
  });
  if (!parsed.success) return validationState(parsed.error, formData);

  if (id === null) {
    const created = createSlide(parsed.data);
    revalidateSite();
    redirect(`/admin/hero/${created}?letrehozva=1`);
  }

  const previousImage = getSlide(id)?.image?.id ?? null;
  updateSlide(id, parsed.data);
  if (previousImage !== parsed.data.mediaId) deleteMediaIfUnused(previousImage);
  revalidateSite();
  return successState('A slide mentve, a főoldalon már az új változat látszik.');
}

export async function toggleSlideAction(id: number, isActive: boolean): Promise<void> {
  await requireAdmin();
  setSlideActive(id, isActive);
  revalidateSite();
}

export async function deleteSlideAction(id: number): Promise<void> {
  await requireAdmin();
  deleteMediaIfUnused(deleteSlide(id));
  revalidateSite();
  redirect('/admin/hero');
}
