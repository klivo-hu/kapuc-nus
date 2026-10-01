import { CONSENT_CATEGORIES } from './config';
import type { ConsentState } from './store';

/**
 * Google Consent Mode v2.
 *
 * Defaults are published before any Google tag loads, so measurement starts denied rather than
 * being switched off after the fact. Every signal is mapped to the purpose that gates it.
 */

type ConsentValue = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const SIGNAL_OWNER: Readonly<Record<string, string>> = {
  security_storage: 'necessary',
  functionality_storage: 'functional',
  personalization_storage: 'functional',
};

function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

function toValues(granted: (categoryId: string) => boolean): Record<string, ConsentValue> {
  const values: Record<string, ConsentValue> = {};
  for (const [signal, categoryId] of Object.entries(SIGNAL_OWNER)) {
    values[signal] = granted(categoryId) ? 'granted' : 'denied';
  }
  return values;
}

/** Denies every non-essential signal. Called before any tag is allowed to load. */
export function applyConsentDefaults(): void {
  const essential = new Set(
    CONSENT_CATEGORIES.filter((category) => category.essential).map((category) => category.id),
  );
  gtag('consent', 'default', {
    ...toValues((categoryId) => essential.has(categoryId)),
    wait_for_update: 500,
  });
}

/** Publishes the visitor's decision. Called on every change, including withdrawal. */
export function publishConsent(state: ConsentState): void {
  gtag(
    'consent',
    'update',
    toValues((categoryId) => state.granted[categoryId] === true),
  );
}
