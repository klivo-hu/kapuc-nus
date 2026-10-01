'use server';

import { redirect } from 'next/navigation';
import { checkbox, text } from '@/lib/admin/form-data';
import { errorState, successState, validationState, type FormState } from '@/lib/admin/form-state';
import { revalidateSite } from '@/lib/admin/revalidate';
import { categorySchema } from '@/lib/admin/schemas';
import { requireAdmin } from '@/lib/auth/guard';
import { createCategory, deleteCategory, getCategory, updateCategory } from '@/lib/content/menu';

function parse(formData: FormData) {
  return categorySchema.safeParse({
    name: text(formData, 'name'),
    description: text(formData, 'description'),
    isActive: checkbox(formData, 'isActive'),
  });
}

export async function createCategoryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return validationState(parsed.error, formData);
  createCategory(parsed.data);
  revalidateSite();
  return successState(`A(z) „${parsed.data.name}” kategória elkészült.`, {});
}

export async function updateCategoryAction(
  id: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (!getCategory(id)) return errorState('Ez a kategória már nem létezik.');
  const parsed = parse(formData);
  if (!parsed.success) return validationState(parsed.error, formData);
  updateCategory(id, parsed.data);
  revalidateSite();
  return successState('A kategória mentve.');
}

export async function toggleCategoryAction(id: number, isActive: boolean): Promise<void> {
  await requireAdmin();
  const category = getCategory(id);
  if (!category) return;
  updateCategory(id, { name: category.name, description: category.description, isActive });
  revalidateSite();
}

export async function deleteCategoryAction(id: number): Promise<void> {
  await requireAdmin();
  const result = deleteCategory(id);
  revalidateSite();
  redirect(
    result.ok ? '/admin/kategoriak' : `/admin/kategoriak?nem-torolheto=${result.productCount}`,
  );
}
