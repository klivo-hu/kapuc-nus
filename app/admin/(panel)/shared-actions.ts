'use server';

import { revalidateSite } from '@/lib/admin/revalidate';
import { requireAdmin } from '@/lib/auth/guard';
import { getMedia, setFocalPoint } from '@/lib/content/media';
import { moveRow, type MoveDirection, type OrderableList } from '@/lib/db/ordering';

const LISTS: readonly OrderableList[] = [
  'hero_slides',
  'menu_categories',
  'products',
  'featured_products',
  'gallery_items',
  'gallery_categories',
];
const DIRECTIONS: readonly MoveDirection[] = ['up', 'down', 'first', 'last'];

export async function moveItemAction(
  list: OrderableList,
  id: number,
  direction: MoveDirection,
): Promise<void> {
  await requireAdmin();
  if (!LISTS.includes(list) || !DIRECTIONS.includes(direction) || !Number.isInteger(id)) return;
  moveRow(list, id, direction);
  revalidateSite();
}

/** Sets where an image is cropped around; returns the stored point. */
export async function setFocalPointAction(
  id: string,
  focalX: number,
  focalY: number,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  if (!getMedia(id) || !Number.isFinite(focalX) || !Number.isFinite(focalY)) return { ok: false };
  setFocalPoint(id, focalX, focalY);
  revalidateSite();
  return { ok: true };
}
