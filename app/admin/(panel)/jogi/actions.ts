'use server';

import { text } from '@/lib/admin/form-data';
import type { FormState } from '@/lib/admin/form-state';
import { saveSettingsForm } from '@/lib/admin/settings-save';
import { requireAdmin } from '@/lib/auth/guard';

export async function saveOperatorAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  return saveSettingsForm(
    'operator',
    {
      companyName: text(formData, 'companyName'),
      seat: text(formData, 'seat'),
      registrationNumber: text(formData, 'registrationNumber'),
      taxNumber: text(formData, 'taxNumber'),
      email: text(formData, 'email'),
      phone: text(formData, 'phone'),
      hostingProvider: text(formData, 'hostingProvider'),
      hostingAddress: text(formData, 'hostingAddress'),
      hostingContact: text(formData, 'hostingContact'),
    },
    formData,
    'Az üzemeltető adatai mentve.',
  );
}

export async function saveLegalAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  return saveSettingsForm(
    'legal',
    {
      privacy: text(formData, 'privacy'),
      cookies: text(formData, 'cookies'),
      impressumNote: text(formData, 'impressumNote'),
      effectiveDate: text(formData, 'effectiveDate'),
    },
    formData,
    'A jogi szövegek mentve.',
  );
}
