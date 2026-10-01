import 'server-only';
import { successState, validationState, type FormState } from '@/lib/admin/form-state';
import { revalidateSite } from '@/lib/admin/revalidate';
import { deleteMediaIfUnused } from '@/lib/content/media';
import { getSettings, saveSettings } from '@/lib/content/settings';
import { SETTINGS_SCHEMAS, type SettingsKey } from '@/lib/content/settings-schema';

/** Every media id mentioned anywhere in a settings value (image fields are named `…Id` or `id`). */
function mediaIds(value: unknown): Set<string> {
  const found = new Set<string>();
  const visit = (node: unknown, key?: string) => {
    if (typeof node === 'string' && key && /(^id$|Id$)/.test(key)) found.add(node);
    else if (Array.isArray(node)) node.forEach((item) => visit(item));
    else if (node && typeof node === 'object')
      Object.entries(node).forEach(([k, v]) => visit(v, k));
  };
  visit(value);
  return found;
}

/**
 * Validates and stores one settings group from an admin form, then frees any image the group no
 * longer uses (if nothing else uses it either) and refreshes the public site.
 */
export function saveSettingsForm(
  key: SettingsKey,
  value: unknown,
  formData: FormData,
  message: string,
): FormState {
  const parsed = SETTINGS_SCHEMAS[key].safeParse(value);
  if (!parsed.success) return validationState(parsed.error, formData);

  const before = mediaIds(getSettings(key));
  saveSettings(key, parsed.data);
  const after = mediaIds(parsed.data);
  for (const id of before) if (!after.has(id)) deleteMediaIfUnused(id);

  revalidateSite();
  return successState(message);
}
