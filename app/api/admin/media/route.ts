import { listMedia } from '@/lib/content/media';
import { authorizeApiRequest } from '@/lib/auth/guard';

/** The media library for the admin's image picker, newest first. */
export async function GET(request: Request): Promise<Response> {
  const denied = await authorizeApiRequest(request);
  if (denied) return denied;
  return Response.json({ items: listMedia() }, { headers: { 'Cache-Control': 'no-store' } });
}
