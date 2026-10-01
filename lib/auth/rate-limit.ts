/**
 * A fixed-window attempt counter, kept in memory. The site runs as one Node process, so memory is
 * the whole truth; a restart forgets old attempts, which only ever errs toward the visitor.
 */
export interface RateLimiter {
  /** Whether `key` may make another attempt right now. */
  check(key: string, now?: number): { allowed: boolean; retryAfterSeconds: number };
  /** Records a failed attempt. */
  fail(key: string, now?: number): void;
  /** Clears the counter after a success. */
  reset(key: string): void;
}

export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const attempts = new Map<string, { count: number; resetAt: number }>();

  const current = (key: string, now: number) => {
    const entry = attempts.get(key);
    if (entry && entry.resetAt <= now) {
      attempts.delete(key);
      return undefined;
    }
    return entry;
  };

  return {
    check(key, now = Date.now()) {
      const entry = current(key, now);
      if (!entry || entry.count < limit) return { allowed: true, retryAfterSeconds: 0 };
      return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
    },
    fail(key, now = Date.now()) {
      const entry = current(key, now);
      if (entry) entry.count += 1;
      else attempts.set(key, { count: 1, resetAt: now + windowMs });
    },
    reset(key) {
      attempts.delete(key);
    },
  };
}
