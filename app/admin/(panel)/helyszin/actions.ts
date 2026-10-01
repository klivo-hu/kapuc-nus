'use server';

import { checkbox, text } from '@/lib/admin/form-data';
import { errorState, type FormState } from '@/lib/admin/form-state';
import { saveSettingsForm } from '@/lib/admin/settings-save';
import { requireAdmin } from '@/lib/auth/guard';

const DAYS = 7;

function coordinate(formData: FormData, name: string): number | null | typeof NaN {
  const raw = text(formData, name).replace(',', '.');
  if (raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : Number.NaN;
}

export async function saveLocationAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const hours = Array.from({ length: DAYS }, (_, day) => ({
    closed: checkbox(formData, `hours.${day}.closed`),
    open: text(formData, `hours.${day}.open`),
    close: text(formData, `hours.${day}.close`),
  }));
  // A day needs both times, or neither (not yet published), or the closed mark.
  const dayErrors: Record<string, string> = {};
  hours.forEach((day, index) => {
    if (!day.closed && (day.open === '') !== (day.close === '')) {
      dayErrors[`hours.${index}.${day.open === '' ? 'open' : 'close'}`] =
        'Add meg a nyitást és a zárást is.';
    }
  });
  if (Object.keys(dayErrors).length > 0)
    return errorState('Néhány mezőt javítani kell.', formData, dayErrors);

  return saveSettingsForm(
    'location',
    {
      name: text(formData, 'name'),
      street: text(formData, 'street'),
      postalCode: text(formData, 'postalCode'),
      city: text(formData, 'city'),
      mapEmbedUrl: text(formData, 'mapEmbedUrl'),
      directionsUrl: text(formData, 'directionsUrl'),
      mapsUrl: text(formData, 'mapsUrl'),
      phone: text(formData, 'phone'),
      email: text(formData, 'email'),
      hours: hours.map((day) => (day.closed ? { closed: true, open: '', close: '' } : day)),
      hoursNote: text(formData, 'hoursNote'),
      latitude: coordinate(formData, 'latitude'),
      longitude: coordinate(formData, 'longitude'),
    },
    formData,
    'A helyszín adatai mentve.',
  );
}
