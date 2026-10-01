// @ts-check
/**
 * Password hashing with Node's built-in scrypt — no native dependency, memory-hard, and shared by
 * the server (lib/auth/credentials.ts) and the CLI that produces ADMIN_PASSWORD_HASH
 * (scripts/hash-password.mjs). Stored format: `scrypt:N:r:p:<salt base64url>:<hash base64url>`.
 *
 * The separator is a colon, not the usual `// @ts-check
/**
 * Password hashing with Node's built-in scrypt — no native dependency, memory-hard, and shared by
 * the server (lib/auth/credentials.ts) and the CLI that produces ADMIN_PASSWORD_HASH
: the hash travels through .env files, and both
 * Docker Compose and Next.js expand `$NAME` there, which would silently corrupt the hash.
 */
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;
/** scrypt needs 128·N·r bytes; allow headroom above Node's 32 MB default. */
const MAX_MEMORY = 64 * 1024 * 1024;
const SEPARATOR = ':';

/**
 * @param {string} password
 * @param {Buffer} salt
 * @param {{ N: number, r: number, p: number, keylen: number }} params
 * @returns {Promise<Buffer>}
 */
function derive(password, salt, params) {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password.normalize('NFKC'),
      salt,
      params.keylen,
      { N: params.N, r: params.r, p: params.p, maxmem: MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

/** @param {string} password @returns {Promise<string>} */
export async function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt, { N, r: R, p: P, keylen: KEY_LENGTH });
  return ['scrypt', N, R, P, salt.toString('base64url'), key.toString('base64url')].join(SEPARATOR);
}

/**
 * Constant-time comparison against a stored hash. A malformed hash never verifies.
 * @param {string} password
 * @param {string} stored
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  const parts = stored.split(SEPARATOR);
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltText, hashText] = parts;
  const params = { N: Number(n), r: Number(r), p: Number(p), keylen: 0 };
  if (![params.N, params.r, params.p].every((value) => Number.isInteger(value) && value > 0))
    return false;
  const expected = Buffer.from(hashText ?? '', 'base64url');
  if (expected.length === 0) return false;
  params.keylen = expected.length;
  const actual = await derive(password, Buffer.from(saltText ?? '', 'base64url'), params);
  return timingSafeEqual(actual, expected);
}
