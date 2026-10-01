'use server';

import { redirect } from 'next/navigation';
import {
  checkbox,
  list,
  mediaIdField,
  optionalId,
  optionalInteger,
  text,
} from '@/lib/admin/form-data';
import { errorState, successState, validationState, type FormState } from '@/lib/admin/form-state';
import { revalidateSite } from '@/lib/admin/revalidate';
import { productSchema } from '@/lib/admin/schemas';
import { requireAdmin } from '@/lib/auth/guard';
import { deleteMediaIfUnused } from '@/lib/content/media';
import {
  createProduct,
  deleteProduct,
  getCategory,
  getProduct,
  setProductFlag,
  updateProduct,
} from '@/lib/content/menu';

function parse(formData: FormData) {
  return productSchema.safeParse({
    categoryId: optionalId(formData, 'categoryId') ?? Number.NaN,
    name: text(formData, 'name'),
    description: text(formData, 'description'),
    price: optionalInteger(formData, 'price'),
    priceNote: text(formData, 'priceNote'),
    mediaId: mediaIdField(formData, 'mediaId'),
    allergens: text(formData, 'allergens'),
    dietary: list(formData, 'dietary'),
    isFeatured: checkbox(formData, 'isFeatured'),
    isAvailable: checkbox(formData, 'isAvailable'),
  });
}

export async function saveProductAction(
  id: number | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return validationState(parsed.error, formData);
  if (!getCategory(parsed.data.categoryId)) {
    return errorState('A kiválasztott kategória nem létezik.', formData, {
      categoryId: 'Válassz kategóriát.',
    });
  }

  if (id === null) {
    const created = createProduct(parsed.data);
    revalidateSite();
    redirect(`/admin/termekek/${created}?letrehozva=1`);
  }

  const previousImage = getProduct(id)?.image?.id ?? null;
  updateProduct(id, parsed.data);
  if (previousImage !== parsed.data.mediaId) deleteMediaIfUnused(previousImage);
  revalidateSite();
  return successState('A termék mentve.');
}

export async function toggleProductAction(
  id: number,
  flag: 'featured' | 'available',
  value: boolean,
): Promise<void> {
  await requireAdmin();
  if (flag !== 'featured' && flag !== 'available') return;
  setProductFlag(id, flag, value);
  revalidateSite();
}

export async function deleteProductAction(id: number): Promise<void> {
  await requireAdmin();
  deleteMediaIfUnused(deleteProduct(id));
  revalidateSite();
  redirect('/admin/termekek');
}
