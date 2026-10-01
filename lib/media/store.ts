import 'server-only';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '@/lib/env';
import { getMedia, insertMedia, type MediaRecord } from '@/lib/content/media';
import { MAX_INPUT_PIXELS, encodeVariants } from './encode.mjs';
import { mediaDir } from './paths';

const MIN_DIMENSION = 200;
const MAX_DIMENSION = 12_000;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;

type Sniffed = 'jpeg' | 'png' | 'webp' | 'avif';

/** Identifies the file by its first bytes; the extension and declared MIME type are not trusted. */
export function sniffImageType(bytes: Uint8Array): Sniffed | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (ascii(0, 8) === '\x89PNG\r\n\x1a\n') return 'png';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp';
  if (ascii(4, 8) === 'ftyp' && /avif|avis/.test(ascii(8, 32))) return 'avif';
  return null;
}

/** Characters never kept in a display name: control characters and path/shell punctuation. */
const UNSAFE_NAME_CHARACTERS = new Set('<>:"/\\|?*');

/** Keeps a readable original name for the admin's media list. Never used as a path. */
function displayName(name: string): string {
  const base = [...path.basename(name)]
    .filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127)
    .filter((character) => !UNSAFE_NAME_CHARACTERS.has(character))
    .join('')
    .trim();
  return (base || 'kep').slice(0, 120);
}

export class UploadError extends Error {}

/**
 * Validates an uploaded image, re-encodes it into responsive AVIF/WebP variants, and records it.
 * The upload itself is discarded: what is served is always our own encoding, metadata stripped.
 */
export async function storeUpload(file: File): Promise<MediaRecord> {
  const limit = env.maxUploadBytes;
  if (file.size === 0) throw new UploadError('A fájl üres.');
  if (file.size > limit) {
    throw new UploadError(`A kép legfeljebb ${Math.round(limit / 1024 / 1024)} MB lehet.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = sniffImageType(buffer);
  if (!type) throw new UploadError('Csak JPG, PNG, WebP vagy AVIF kép tölthető fel.');

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  } catch {
    throw new UploadError('A képfájl sérült vagy nem olvasható.');
  }
  const { width = 0, height = 0 } = metadata;
  if (Math.min(width, height) < MIN_DIMENSION) {
    throw new UploadError(
      `A kép túl kicsi: legalább ${MIN_DIMENSION} képpont széles és magas legyen.`,
    );
  }
  if (Math.max(width, height) > MAX_DIMENSION) {
    throw new UploadError(`A kép túl nagy: legfeljebb ${MAX_DIMENSION} képpont lehet egy oldala.`);
  }

  const id = `m${randomBytes(10).toString('hex')}`;
  const directory = mediaDir(id);
  try {
    const encoded = await encodeVariants(buffer, directory);
    insertMedia({ id, originalName: displayName(file.name), ...encoded });
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error instanceof UploadError
      ? error
      : new UploadError('A kép feldolgozása nem sikerült.');
  }

  const record = getMedia(id);
  if (!record) throw new UploadError('A kép mentése nem sikerült.');
  return record;
}

/**
 * The Open Graph crop: 1200×630 around the focal point, written once next to the variants and
 * regenerated when the focal point moves (the file name carries it).
 */
export async function ensureOgImage(record: MediaRecord): Promise<string> {
  const file = path.join(
    mediaDir(record.id),
    `og-${Math.round(record.focalX)}-${Math.round(record.focalY)}.jpg`,
  );
  if (existsSync(file)) return file;

  const largest = record.widths.at(-1) ?? record.width;
  const source = path.join(mediaDir(record.id), `${largest}.webp`);
  const scale = Math.max(OG_WIDTH / record.width, OG_HEIGHT / record.height);
  const scaledWidth = Math.ceil(record.width * scale);
  const scaledHeight = Math.ceil(record.height * scale);
  const left = Math.round(
    Math.min(
      scaledWidth - OG_WIDTH,
      Math.max(0, (record.focalX / 100) * scaledWidth - OG_WIDTH / 2),
    ),
  );
  const top = Math.round(
    Math.min(
      scaledHeight - OG_HEIGHT,
      Math.max(0, (record.focalY / 100) * scaledHeight - OG_HEIGHT / 2),
    ),
  );
  await sharp(source)
    .resize(scaledWidth, scaledHeight)
    .extract({ left, top, width: OG_WIDTH, height: OG_HEIGHT })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(file);
  return file;
}
