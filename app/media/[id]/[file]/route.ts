import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getMedia } from '@/lib/content/media';
import { MEDIA_ID_PATTERN, mediaDir } from '@/lib/media/paths';
import { ensureOgImage } from '@/lib/media/store';

/**
 * Serves encoded images from the media store. A variant never changes once written — a new
 * upload gets a new id — so every response is cacheable for a year.
 */
const VARIANT_PATTERN = /^(\d{2,4})\.(avif|webp)$/;
const IMMUTABLE = 'public, max-age=31536000, immutable';

const CONTENT_TYPES = { avif: 'image/avif', webp: 'image/webp', jpg: 'image/jpeg' } as const;

function notFound(): Response {
  return new Response('Not found', { status: 404 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; file: string }> },
): Promise<Response> {
  const { id, file } = await params;
  if (!MEDIA_ID_PATTERN.test(id)) return notFound();

  let filePath: string;
  let contentType: string;
  let cacheControl = IMMUTABLE;

  const variant = VARIANT_PATTERN.exec(file);
  if (variant) {
    const format = variant[2] as 'avif' | 'webp';
    filePath = path.join(mediaDir(id), file);
    contentType = CONTENT_TYPES[format];
  } else if (file === 'og.jpg') {
    // The focal point can move, so the crop URL is revalidated daily rather than pinned forever.
    const record = getMedia(id);
    if (!record) return notFound();
    filePath = await ensureOgImage(record);
    contentType = CONTENT_TYPES.jpg;
    cacheControl = 'public, max-age=86400';
  } else {
    return notFound();
  }

  const etag = `"${id}-${path.basename(filePath)}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, {
      status: 304,
      headers: { ETag: etag, 'Cache-Control': cacheControl },
    });
  }

  try {
    const body = await readFile(filePath);
    return new Response(new Uint8Array(body), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(body.length),
        'Cache-Control': cacheControl,
        ETag: etag,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return notFound();
  }
}
