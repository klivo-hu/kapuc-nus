import 'server-only';
import path from 'node:path';
import { env } from '@/lib/env';

/** Media ids are generated (`m` + random) or seeded (`seed-` + file key); nothing else is valid. */
export const MEDIA_ID_PATTERN = /^[a-z0-9-]{4,64}$/;

export function mediaRoot(): string {
  return path.join(env.dataDir, 'media');
}

/** The directory holding one image's variants. Refuses ids that could escape the media root. */
export function mediaDir(id: string): string {
  if (!MEDIA_ID_PATTERN.test(id)) throw new Error(`Invalid media id: ${id}`);
  return path.join(mediaRoot(), id);
}

/** Build-time encoded seed photographs (scripts/prepare-assets.mjs). */
export function seedMediaRoot(): string {
  return path.resolve(process.env.SEED_MEDIA_DIR ?? path.join(process.cwd(), '.seed-media'));
}
