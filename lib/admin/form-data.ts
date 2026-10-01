/** Readers for FormData fields, normalizing what browsers send into typed values. */

export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === 'on';
}

/** A whole number, tolerant of the spaces and dots people type in prices ("1 290", "1.290"). */
export function optionalInteger(formData: FormData, name: string): number | null | typeof NaN {
  const raw = text(formData, name)
    .replace(/[\s.\u00a0]/g, '')
    .replace(/ft$/i, '');
  if (raw === '') return null;
  return /^\d+$/.test(raw) ? Number(raw) : Number.NaN;
}

export function optionalId(formData: FormData, name: string): number | null {
  const raw = text(formData, name);
  if (raw === '') return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function mediaIdField(formData: FormData, name: string): string | null {
  const raw = text(formData, name);
  return /^[a-z0-9-]{4,64}$/.test(raw) ? raw : null;
}

export function list(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((value): value is string => typeof value === 'string');
}
