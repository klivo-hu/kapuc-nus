import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '@/lib/auth/rate-limit';
import { hashPassword, verifyPassword } from '../lib/auth/scrypt.mjs';

describe('scrypt password hashing', () => {
  it('verifies the right password and refuses the wrong one', async () => {
    const hash = await hashPassword('egy hosszú jelszó');
    // No `$` anywhere: the hash must survive .env variable expansion untouched.
    expect(hash).toMatch(/^scrypt:32768:8:1:[\w-]+:[\w-]+$/);
    expect(hash).not.toContain('$');
    expect(await verifyPassword('egy hosszú jelszó', hash)).toBe(true);
    expect(await verifyPassword('egy hosszu jelszo', hash)).toBe(false);
  });

  it('salts every hash', async () => {
    expect(await hashPassword('ugyanaz')).not.toBe(await hashPassword('ugyanaz'));
  });

  it('never verifies against a malformed hash', async () => {
    expect(await verifyPassword('x', 'plain-text')).toBe(false);
    expect(await verifyPassword('x', 'scrypt:0:8:1:abc:def')).toBe(false);
    expect(await verifyPassword('x', 'scrypt:32768:8:1:abc:')).toBe(false);
  });
});

describe('createRateLimiter', () => {
  it('blocks after the limit within the window, and forgives after it', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
    for (let attempt = 0; attempt < 3; attempt++) {
      expect(limiter.check('ip', 0).allowed).toBe(true);
      limiter.fail('ip', 0);
    }
    expect(limiter.check('ip', 500)).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(limiter.check('other-ip', 500).allowed).toBe(true);
    expect(limiter.check('ip', 1001).allowed).toBe(true);
  });

  it('resets after a success', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.fail('ip', 0);
    expect(limiter.check('ip', 1).allowed).toBe(false);
    limiter.reset('ip');
    expect(limiter.check('ip', 2).allowed).toBe(true);
  });
});
