/** "Hideg italok" → "hideg-italok". Accents (including ő and ű) fold to their base letters. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Appends -2, -3, … until the slug is not taken. */
export function uniqueSlug(value: string, isTaken: (slug: string) => boolean): string {
  const base = slugify(value) || 'kategoria';
  let candidate = base;
  for (let suffix = 2; isTaken(candidate); suffix++) candidate = `${base}-${suffix}`;
  return candidate;
}
