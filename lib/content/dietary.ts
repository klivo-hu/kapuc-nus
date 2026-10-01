import { DIETARY_TAGS, type DietaryTag } from './types';

export const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegan: 'vegán',
  vegetarian: 'vegetáriánus',
  'gluten-free': 'gluténmentes',
  'lactose-free': 'laktózmentes',
  'sugar-free': 'hozzáadott cukor nélkül',
};

/** Parses the stored comma list, dropping anything that is not a known tag. */
export function parseDietary(value: string): DietaryTag[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag): tag is DietaryTag => (DIETARY_TAGS as readonly string[]).includes(tag));
}
