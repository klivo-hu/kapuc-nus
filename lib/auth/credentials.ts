import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { AdminCredentials } from '@/lib/env';
import { verifyPassword } from './scrypt.mjs';

const digest = (value: string) => createHash('sha256').update(value.normalize('NFKC')).digest();

/** Constant-time comparison of equal-length digests, so string length leaks nothing either. */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

/** Checks a login attempt against the configured admin. Both halves are always evaluated. */
export async function checkCredentials(
  credentials: AdminCredentials,
  username: string,
  password: string,
): Promise<boolean> {
  const userMatches = safeEqual(username.trim(), credentials.username);
  const passwordMatches = credentials.passwordHash
    ? await verifyPassword(password, credentials.passwordHash)
    : safeEqual(password, credentials.password ?? '');
  return userMatches && passwordMatches;
}
