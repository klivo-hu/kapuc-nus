import { db } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

/** Container health: the server answers and the database is readable. */
export function GET(): Response {
  try {
    db().prepare('SELECT 1').get();
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[health]', error);
    return Response.json(
      { status: 'error' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
