import 'server-only';
import { rmSync } from 'node:fs';
import { db } from '@/lib/db/client';
import { mediaDir } from '@/lib/media/paths';
import { DEFAULT_SETTINGS } from './settings-defaults';
import type { ImageAsset } from './types';

export interface MediaRow {
  id: string;
  original_name: string;
  width: number;
  height: number;
  color: string;
  widths: string;
  bytes: number;
  focal_x: number;
  focal_y: number;
  created_at: string;
}

export interface MediaRecord extends ImageAsset {
  readonly originalName: string;
  readonly bytes: number;
  readonly createdAt: string;
}

/** Columns for a LEFT JOIN on media aliased `m`, prefixed so they never collide. */
export const MEDIA_JOIN_COLUMNS =
  'm.id AS m_id, m.width AS m_width, m.height AS m_height, m.color AS m_color, m.widths AS m_widths, m.focal_x AS m_focal_x, m.focal_y AS m_focal_y';

export interface JoinedMediaColumns {
  m_id: string | null;
  m_width: number | null;
  m_height: number | null;
  m_color: string | null;
  m_widths: string | null;
  m_focal_x: number | null;
  m_focal_y: number | null;
}

function parseWidths(value: string): number[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((w): w is number => typeof w === 'number') : [];
  } catch {
    return [];
  }
}

export function assetFromJoin(row: JoinedMediaColumns): ImageAsset | null {
  if (row.m_id === null || row.m_width === null || row.m_height === null) return null;
  return {
    id: row.m_id,
    width: row.m_width,
    height: row.m_height,
    color: row.m_color ?? '#d6bea4',
    widths: parseWidths(row.m_widths ?? '[]'),
    focalX: row.m_focal_x ?? 50,
    focalY: row.m_focal_y ?? 50,
  };
}

function toRecord(row: MediaRow): MediaRecord {
  return {
    id: row.id,
    width: row.width,
    height: row.height,
    color: row.color,
    widths: parseWidths(row.widths),
    focalX: row.focal_x,
    focalY: row.focal_y,
    originalName: row.original_name,
    bytes: row.bytes,
    createdAt: row.created_at,
  };
}

export function getMedia(id: string | null | undefined): MediaRecord | null {
  if (!id) return null;
  const row = db().prepare('SELECT * FROM media WHERE id = ?').get(id) as MediaRow | undefined;
  return row ? toRecord(row) : null;
}

export function listMedia(limit = 120): MediaRecord[] {
  const rows = db()
    .prepare('SELECT * FROM media ORDER BY created_at DESC, id LIMIT ?')
    .all(limit) as MediaRow[];
  return rows.map(toRecord);
}

export function insertMedia(record: {
  id: string;
  originalName: string;
  width: number;
  height: number;
  color: string;
  widths: number[];
  bytes: number;
}): void {
  db()
    .prepare(
      `INSERT INTO media (id, original_name, width, height, color, widths, bytes)
       VALUES (@id, @originalName, @width, @height, @color, @widths, @bytes)`,
    )
    .run({ ...record, widths: JSON.stringify(record.widths) });
}

export function setFocalPoint(id: string, focalX: number, focalY: number): void {
  const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));
  db()
    .prepare('UPDATE media SET focal_x = ?, focal_y = ? WHERE id = ?')
    .run(clamp(focalX), clamp(focalY), id);
}

/** Whether any content still points at this image, including settings JSON. */
export function isMediaReferenced(id: string): boolean {
  const database = db();
  const inTables = database
    .prepare(
      `SELECT 1 FROM hero_slides WHERE media_id = @id
       UNION ALL SELECT 1 FROM products WHERE media_id = @id
       UNION ALL SELECT 1 FROM gallery_items WHERE media_id = @id
       LIMIT 1`,
    )
    .get({ id });
  if (inTables) return true;
  // Settings: a saved group is checked as stored; a never-saved group still reads its defaults.
  const needle = `"${id}"`;
  const saved = database.prepare('SELECT key, value FROM settings').all() as {
    key: string;
    value: string;
  }[];
  const savedKeys = new Set(saved.map((row) => row.key));
  if (saved.some((row) => row.value.includes(needle))) return true;
  return Object.entries(DEFAULT_SETTINGS).some(
    ([key, value]) => !savedKeys.has(key) && JSON.stringify(value).includes(needle),
  );
}

/**
 * Uploads that were never saved into any content (a form abandoned after choosing an image) are
 * removed once they are a day old, so the media store only holds images that are in use or new.
 */
export function sweepAbandonedUploads(): void {
  const stale = db()
    .prepare("SELECT id FROM media WHERE created_at < datetime('now', '-1 day')")
    .all() as { id: string }[];
  for (const { id } of stale) deleteMediaIfUnused(id);
}

/** Removes an image that nothing references any more — its row and its files. */
export function deleteMediaIfUnused(id: string | null | undefined): void {
  if (!id || isMediaReferenced(id)) return;
  db().prepare('DELETE FROM media WHERE id = ?').run(id);
  rmSync(mediaDir(id), { recursive: true, force: true });
}
