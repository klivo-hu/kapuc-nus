import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { hasValidSession } from './session';

export const LOGIN_PATH = '/admin/belepes';

/**
 * Gate for admin pages and server actions. Every action calls this itself — a server action is a
 * public endpoint, and the layout's check does not protect it.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await hasValidSession())) redirect(LOGIN_PATH);
}

/**
 * Gate for admin route handlers: a live session, and a same-origin request. Server actions get
 * the origin check from Next.js; plain route handlers must do it themselves.
 */
export async function authorizeApiRequest(request: Request): Promise<Response | null> {
  if (!(await hasValidSession()))
    return Response.json({ error: 'Nincs bejelentkezve.' }, { status: 401 });
  if (request.method !== 'GET' && !(await isSameOrigin(request))) {
    return Response.json({ error: 'Érvénytelen kérés.' }, { status: 403 });
  }
  return null;
}

async function isSameOrigin(request: Request): Promise<boolean> {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** The client address for rate limiting: the first X-Forwarded-For hop behind the proxy. */
export async function clientAddress(): Promise<string> {
  const requestHeaders = await headers();
  if (env.trustProxy) {
    const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (forwarded) return forwarded;
  }
  return requestHeaders.get('x-real-ip') ?? 'unknown';
}
