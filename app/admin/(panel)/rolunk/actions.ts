'use server';

import { mediaIdField, text } from '@/lib/admin/form-data';
import { errorState, type FormState } from '@/lib/admin/form-state';
import { saveSettingsForm } from '@/lib/admin/settings-save';
import { requireAdmin } from '@/lib/auth/guard';
import { ATMOSPHERE_SLOTS, VALUE_ROWS } from './constants';

export async function saveHomeAboutAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  return saveSettingsForm(
    'about',
    {
      heading: text(formData, 'heading'),
      lead: text(formData, 'lead'),
      body: text(formData, 'body'),
      note: text(formData, 'note'),
      primaryImageId: mediaIdField(formData, 'primaryImageId'),
      primaryImageAlt: text(formData, 'primaryImageAlt'),
      secondaryImageId: mediaIdField(formData, 'secondaryImageId'),
      secondaryImageAlt: text(formData, 'secondaryImageAlt'),
    },
    formData,
    'A főoldali Rólunk szekció mentve.',
  );
}

export async function saveAboutPageAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  // Value rows: fully empty rows are skipped; a row with text but no title is an error on that row.
  const values: { title: string; text: string }[] = [];
  const rowErrors: Record<string, string> = {};
  for (let row = 0; row < VALUE_ROWS; row++) {
    const title = text(formData, `values.${row}.title`);
    const body = text(formData, `values.${row}.text`);
    if (!title && !body) continue;
    if (!title)
      rowErrors[`values.${row}.title`] = 'Adj címet ennek az értéknek, vagy töröld a szövegét.';
    values.push({ title, text: body });
  }
  if (Object.keys(rowErrors).length > 0)
    return errorState('Néhány mezőt javítani kell.', formData, rowErrors);

  const atmosphereImages = Array.from({ length: ATMOSPHERE_SLOTS }, (_, slot) => ({
    id: mediaIdField(formData, `atmosphere.${slot}.id`),
    alt: text(formData, `atmosphere.${slot}.alt`),
  })).filter((entry) => entry.id !== null);

  return saveSettingsForm(
    'aboutPage',
    {
      heading: text(formData, 'heading'),
      lead: text(formData, 'lead'),
      heroImage: {
        id: mediaIdField(formData, 'heroImage.id'),
        alt: text(formData, 'heroImage.alt'),
      },
      storyHeading: text(formData, 'storyHeading'),
      storyBody: text(formData, 'storyBody'),
      valuesHeading: text(formData, 'valuesHeading'),
      values,
      atmosphereHeading: text(formData, 'atmosphereHeading'),
      atmosphereBody: text(formData, 'atmosphereBody'),
      atmosphereImages,
      teamHeading: text(formData, 'teamHeading'),
      teamBody: text(formData, 'teamBody'),
      teamImage: {
        id: mediaIdField(formData, 'teamImage.id'),
        alt: text(formData, 'teamImage.alt'),
      },
      closingNote: text(formData, 'closingNote'),
    },
    formData,
    'A Rólunk oldal mentve.',
  );
}
