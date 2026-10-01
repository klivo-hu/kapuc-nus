'use server';

import { mediaIdField, text } from '@/lib/admin/form-data';
import type { FormState } from '@/lib/admin/form-state';
import { saveSettingsForm } from '@/lib/admin/settings-save';
import { requireAdmin } from '@/lib/auth/guard';

export async function saveSiteAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  return saveSettingsForm(
    'site',
    {
      brandName: text(formData, 'brandName'),
      tagline: text(formData, 'tagline'),
      homeHeading: text(formData, 'homeHeading'),
      seoTitle: text(formData, 'seoTitle'),
      seoDescription: text(formData, 'seoDescription'),
      ogImageId: mediaIdField(formData, 'ogImageId'),
      logoId: mediaIdField(formData, 'logoId'),
      iconId: mediaIdField(formData, 'iconId'),
    },
    formData,
    'A beállítások mentve.',
  );
}
