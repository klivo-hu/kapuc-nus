import 'server-only';
import path from 'node:path';

/**
 * Server-side configuration, read at runtime rather than inlined at build time — the Docker image
 * is built once and configured per environment through the platform's .env. Nothing here reaches
 * the client bundle.
 */

const MEGABYTE = 1024 * 1024;
const DEFAULT_MAX_UPLOAD_MB = 12;
const MIN_SESSION_SECRET_LENGTH = 32;

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },

  /** Where the SQLite database and uploaded media live. A named volume in Docker. */
  get dataDir(): string {
    return path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), 'data'));
  },

  /** Public origin for canonical URLs, sitemap, and Open Graph. */
  get siteUrl(): string {
    const configured = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
    return (configured ?? 'http://localhost:3000').replace(/\/+$/, '');
  },

  get maxUploadBytes(): number {
    return readNumber(process.env.MAX_UPLOAD_MB, DEFAULT_MAX_UPLOAD_MB) * MEGABYTE;
  },

  /** Secure cookies unless explicitly disabled (for plain-HTTP local testing of a prod build). */
  get cookieSecure(): boolean {
    if (process.env.COOKIE_SECURE === 'false') return false;
    return env.isProduction;
  },

  /** Behind the platform's Traefik the client address arrives in X-Forwarded-For. */
  get trustProxy(): boolean {
    return process.env.TRUST_PROXY !== 'false';
  },
};

export interface AdminCredentials {
  readonly username: string;
  /** scrypt hash (`npm run admin:hash`), preferred in every deployed environment. */
  readonly passwordHash: string | null;
  /** Plain password — accepted outside production only, for local development. */
  readonly password: string | null;
  readonly sessionSecret: string;
}

/**
 * Admin credentials, or a reason they are unusable. Read lazily so a missing secret disables the
 * admin login with a clear message instead of crashing the public site.
 */
export function adminCredentials():
  { ok: true; value: AdminCredentials } | { ok: false; reason: string } {
  const username = process.env.ADMIN_USERNAME?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim() || null;
  const password = process.env.ADMIN_PASSWORD || null;
  const sessionSecret = process.env.SESSION_SECRET ?? '';

  if (!username) return { ok: false, reason: 'ADMIN_USERNAME nincs beállítva.' };
  if (!passwordHash && !password) {
    return { ok: false, reason: 'ADMIN_PASSWORD_HASH nincs beállítva.' };
  }
  if (!passwordHash && env.isProduction) {
    return {
      ok: false,
      reason: 'Éles környezetben csak ADMIN_PASSWORD_HASH használható (npm run admin:hash).',
    };
  }
  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
    return {
      ok: false,
      reason: `SESSION_SECRET legalább ${MIN_SESSION_SECRET_LENGTH} karakter legyen.`,
    };
  }
  return { ok: true, value: { username, passwordHash, password, sessionSecret } };
}
