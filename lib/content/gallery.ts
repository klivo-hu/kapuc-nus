import 'server-only';
import { db } from '@/lib/db/client';
import { nextPosition } from '@/lib/db/ordering';
import { uniqueSlug } from '@/lib/format/slug';
import { MEDIA_JOIN_COLUMNS, assetFromJoin, type JoinedMediaColumns } from './media';
import type { GalleryCategory, GalleryItem } from './types';

interface ItemRow extends JoinedMediaColumns {
  id: number;
  title: string;
  alt: string;
  description: string;
  category_id: number | null;
  sort_order: number;
  is_active: number;
}

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

const SELECT = `SELECT g.*, ${MEDIA_JOIN_COLUMNS} FROM gallery_items g JOIN media m ON m.id = g.media_id`;

function toItem(row: ItemRow): GalleryItem | null {
  const image = assetFromJoin(row);
  if (!image) return null;
  return {
    id: row.id,
    image,
    title: row.title,
    alt: row.alt,
    description: row.description,
    categoryId: row.category_id,
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
  };
}

const present = <T>(value: T | null): value is T => value !== null;

export function listGallery({ activeOnly }: { activeOnly: boolean }): GalleryItem[] {
  const where = activeOnly ? 'WHERE g.is_active = 1' : '';
  const rows = db().prepare(`${SELECT} ${where} ORDER BY g.sort_order, g.id`).all() as ItemRow[];
  return rows.map(toItem).filter(present);
}

export function getGalleryItem(id: number): GalleryItem | null {
  const row = db().prepare(`${SELECT} WHERE g.id = ?`).get(id) as ItemRow | undefined;
  return row ? toItem(row) : null;
}

export function listGalleryCategories(): GalleryCategory[] {
  const rows = db()
    .prepare('SELECT * FROM gallery_categories ORDER BY sort_order, id')
    .all() as CategoryRow[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
  }));
}

export interface GalleryItemInput {
  title: string;
  alt: string;
  description: string;
  categoryId: number | null;
  isActive: boolean;
}

export function createGalleryItem(mediaId: string, input: GalleryItemInput): number {
  const result = db()
    .prepare(
      `INSERT INTO gallery_items (media_id, title, alt, description, category_id, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      mediaId,
      input.title,
      input.alt,
      input.description,
      input.categoryId,
      input.isActive ? 1 : 0,
      nextPosition('gallery_items'),
    );
  return Number(result.lastInsertRowid);
}

export function updateGalleryItem(id: number, input: GalleryItemInput): void {
  db()
    .prepare(
      'UPDATE gallery_items SET title = ?, alt = ?, description = ?, category_id = ?, is_active = ? WHERE id = ?',
    )
    .run(input.title, input.alt, input.description, input.categoryId, input.isActive ? 1 : 0, id);
}

export function setGalleryItemActive(id: number, isActive: boolean): void {
  db()
    .prepare('UPDATE gallery_items SET is_active = ? WHERE id = ?')
    .run(isActive ? 1 : 0, id);
}

export function deleteGalleryItem(id: number): string | null {
  const database = db();
  const row = database.prepare('SELECT media_id FROM gallery_items WHERE id = ?').get(id) as
    { media_id: string } | undefined;
  database.prepare('DELETE FROM gallery_items WHERE id = ?').run(id);
  return row?.media_id ?? null;
}

function categorySlugTaken(slug: string, exceptId?: number): boolean {
  return (
    db()
      .prepare('SELECT 1 FROM gallery_categories WHERE slug = ? AND id IS NOT ?')
      .get(slug, exceptId ?? null) !== undefined
  );
}

export function createGalleryCategory(name: string): number {
  const result = db()
    .prepare('INSERT INTO gallery_categories (name, slug, sort_order) VALUES (?, ?, ?)')
    .run(
      name,
      uniqueSlug(name, (slug) => categorySlugTaken(slug)),
      nextPosition('gallery_categories'),
    );
  return Number(result.lastInsertRowid);
}

export function renameGalleryCategory(id: number, name: string): void {
  db()
    .prepare('UPDATE gallery_categories SET name = ?, slug = ? WHERE id = ?')
    .run(
      name,
      uniqueSlug(name, (slug) => categorySlugTaken(slug, id)),
      id,
    );
}

/** Items in a deleted category stay in the gallery, uncategorized. */
export function deleteGalleryCategory(id: number): void {
  db().prepare('DELETE FROM gallery_categories WHERE id = ?').run(id);
}
