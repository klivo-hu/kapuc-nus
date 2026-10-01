import 'server-only';
import { db } from '@/lib/db/client';
import { nextPosition } from '@/lib/db/ordering';
import { MEDIA_JOIN_COLUMNS, assetFromJoin, type JoinedMediaColumns } from './media';
import type { HeroSlide } from './types';

interface SlideRow extends JoinedMediaColumns {
  id: number;
  title: string;
  description: string;
  note: string;
  image_alt: string;
  sort_order: number;
  is_active: number;
}

const SELECT = `SELECT s.*, ${MEDIA_JOIN_COLUMNS} FROM hero_slides s LEFT JOIN media m ON m.id = s.media_id`;

function toSlide(row: SlideRow): HeroSlide {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    note: row.note,
    image: assetFromJoin(row),
    imageAlt: row.image_alt,
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
  };
}

/** Slides the public hero shows: active, with an image, in order. */
export function listActiveSlides(): HeroSlide[] {
  const rows = db()
    .prepare(`${SELECT} WHERE s.is_active = 1 AND m.id IS NOT NULL ORDER BY s.sort_order, s.id`)
    .all() as SlideRow[];
  return rows.map(toSlide);
}

export function listSlides(): HeroSlide[] {
  return (db().prepare(`${SELECT} ORDER BY s.sort_order, s.id`).all() as SlideRow[]).map(toSlide);
}

export function getSlide(id: number): HeroSlide | null {
  const row = db().prepare(`${SELECT} WHERE s.id = ?`).get(id) as SlideRow | undefined;
  return row ? toSlide(row) : null;
}

export interface SlideInput {
  title: string;
  description: string;
  note: string;
  mediaId: string | null;
  imageAlt: string;
  isActive: boolean;
}

export function createSlide(input: SlideInput): number {
  const result = db()
    .prepare(
      `INSERT INTO hero_slides (title, description, note, media_id, image_alt, is_active, sort_order)
       VALUES (@title, @description, @note, @mediaId, @imageAlt, @isActive, @sortOrder)`,
    )
    .run({ ...input, isActive: input.isActive ? 1 : 0, sortOrder: nextPosition('hero_slides') });
  return Number(result.lastInsertRowid);
}

export function updateSlide(id: number, input: SlideInput): void {
  db()
    .prepare(
      `UPDATE hero_slides SET title = @title, description = @description, note = @note,
         media_id = @mediaId, image_alt = @imageAlt, is_active = @isActive, updated_at = datetime('now')
       WHERE id = @id`,
    )
    .run({ ...input, id, isActive: input.isActive ? 1 : 0 });
}

export function setSlideActive(id: number, isActive: boolean): void {
  db()
    .prepare('UPDATE hero_slides SET is_active = ? WHERE id = ?')
    .run(isActive ? 1 : 0, id);
}

/** Deletes a slide and returns the image it used, so the caller can clean it up. */
export function deleteSlide(id: number): string | null {
  const database = db();
  const row = database.prepare('SELECT media_id FROM hero_slides WHERE id = ?').get(id) as
    { media_id: string | null } | undefined;
  database.prepare('DELETE FROM hero_slides WHERE id = ?').run(id);
  return row?.media_id ?? null;
}
