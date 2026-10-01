'use server';

import { redirect } from 'next/navigation';
import { text } from '@/lib/admin/form-data';
import { errorState, type FormState } from '@/lib/admin/form-state';
import { checkCredentials } from '@/lib/auth/credentials';
import { clientAddress } from '@/lib/auth/guard';
import { createRateLimiter } from '@/lib/auth/rate-limit';
import { createSession, destroySession } from '@/lib/auth/session';
import { adminCredentials } from '@/lib/env';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
/** Every failure costs a moment, which makes guessing slow without bothering a real admin. */
const FAILURE_DELAY_MS = 600;

const limiter = createRateLimiter({ limit: MAX_ATTEMPTS, windowMs: WINDOW_MS });

export async function loginAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const username = text(formData, 'username');
  const echo = new FormData();
  echo.set('username', username);

  const credentials = adminCredentials();
  if (!credentials.ok) {
    console.error(`[admin] login disabled: ${credentials.reason}`);
    return errorState(
      'Az admin belépés nincs beállítva a szerveren. Szólj a weboldal üzemeltetőjének.',
      echo,
    );
  }

  const address = await clientAddress();
  const gate = limiter.check(address);
  if (!gate.allowed) {
    const minutes = Math.max(1, Math.ceil(gate.retryAfterSeconds / 60));
    return errorState(`Túl sok sikertelen próbálkozás. Próbáld újra ${minutes} perc múlva.`, echo);
  }

  const password = formData.get('password');
  const valid = await checkCredentials(
    credentials.value,
    username,
    typeof password === 'string' ? password : '',
  );
  if (!valid) {
    limiter.fail(address);
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    return errorState('Hibás felhasználónév vagy jelszó.', echo);
  }

  limiter.reset(address);
  await createSession();
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/belepes');
}
