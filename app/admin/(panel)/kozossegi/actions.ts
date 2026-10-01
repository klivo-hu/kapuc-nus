'use server';

import { text } from '@/lib/admin/form-data';
import type { FormState } from '@/lib/admin/form-state';
import { saveSettingsForm } from '@/lib/admin/settings-save';
import { requireAdmin } from '@/lib/auth/guard';

const OTHER_ROWS = 3;

export async function saveSocialAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const others = Array.from({ length: OTHER_ROWS }, (_, row) => ({
    label: text(formData, `others.${row}.label`),
    url: text(formData, `others.${row}.url`),
  })).filter((entry) => entry.label !== '' || entry.url !== '');

  return saveSettingsForm(
    'social',
    {
      instagram: text(formData, 'instagram'),
      facebook: text(formData, 'facebook'),
      tiktok: text(formData, 'tiktok'),
      others,
    },
    formData,
    'A közösségi linkek mentve.',
  );
}
