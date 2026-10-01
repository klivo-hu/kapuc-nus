import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import { adminCredentials, env } from '@/lib/env';

/**
 * Admin sessions. The browser holds a random 256-bit token in an httpOnly, SameSite=Strict
 * cookie; the database holds only an HMAC of it, so a leaked database cannot be replayed as a
 * login. Sessions expire after twelve hours and are deleted on logout.
 */
export const SESSION_COOKIE = 'kapu_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function tokenHash(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}

function secret(): string | null {
  const credentials = adminCredentials();
  return credentials.ok ? credentials.value.sessionSecret : null;
}

export async function createSession(): Promise<void> {
  const key = secret();
  if (!key) throw new Error('Admin authentication is not configured.');
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();
  const database = db();
  database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
  database
    .prepare('INSERT INTO sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)')
    .run(tokenHash(token, key), now, now + SESSION_TTL_MS);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

/** Whether the current request carries a live admin session. */
export async function hasValidSession(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const row = db()
    .prepare('SELECT expires_at FROM sessions WHERE token_hash = ?')
    .get(tokenHash(token, key)) as { expires_at: number } | undefined;
  return row !== undefined && row.expires_at > Date.now();
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const key = secret();
  if (token && key)
    db().prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(token, key));
  store.delete(SESSION_COOKIE);
}
