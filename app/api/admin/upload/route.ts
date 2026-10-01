import { authorizeApiRequest } from '@/lib/auth/guard';
import { sweepAbandonedUploads } from '@/lib/content/media';
import { env } from '@/lib/env';
import { UploadError, storeUpload } from '@/lib/media/store';

/** Multipart overhead allowed on top of the image itself. */
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

/**
 * Receives one image from the admin (sent with XMLHttpRequest so the browser can show upload
 * progress), validates it, and returns the encoded media record. The declared size is checked
 * before the body is read, so an oversized upload is refused without being buffered.
 */
export async function POST(request: Request): Promise<Response> {
  const denied = await authorizeApiRequest(request);
  if (denied) return denied;

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > env.maxUploadBytes + MULTIPART_OVERHEAD_BYTES) {
    return Response.json(
      { error: `A kép legfeljebb ${Math.round(env.maxUploadBytes / 1024 / 1024)} MB lehet.` },
      { status: 413 },
    );
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get('file');
  } catch {
    return Response.json({ error: 'A feltöltés megszakadt. Próbáld újra.' }, { status: 400 });
  }
  if (!(file instanceof File))
    return Response.json({ error: 'Nem érkezett fájl.' }, { status: 400 });

  try {
    const media = await storeUpload(file);
    sweepAbandonedUploads();
    return Response.json({ media }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError)
      return Response.json({ error: error.message }, { status: 422 });
    console.error('[upload]', error);
    return Response.json({ error: 'A kép feldolgozása nem sikerült.' }, { status: 500 });
  }
}
