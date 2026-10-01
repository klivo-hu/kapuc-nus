'use client';

import { useSyncExternalStore } from 'react';

/**
 * Coordination with the intro curtain. The head script adds `intro-pending` to <html> before first
 * paint when the curtain will play; the curtain removes it and announces the end with an event.
 * Anything that should not start underneath the curtain — the consent window taking focus, the
 * hero's first entrance — waits for `useIntroSettled()`.
 */
export const INTRO_PENDING_CLASS = 'intro-pending';
export const INTRO_DONE_EVENT = 'kapucinus:intro-done';
export const INTRO_SEEN_KEY = 'kapucinus-intro-seen';

function subscribe(onChange: () => void): () => void {
  window.addEventListener(INTRO_DONE_EVENT, onChange);
  return () => window.removeEventListener(INTRO_DONE_EVENT, onChange);
}

const isSettled = () => !document.documentElement.classList.contains(INTRO_PENDING_CLASS);

export function useIntroSettled(): boolean {
  return useSyncExternalStore(subscribe, isSettled, () => false);
}

/** Ends the intro: reveals the page and lets waiting components start. */
export function settleIntro(): void {
  document.documentElement.classList.remove(INTRO_PENDING_CLASS);
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    // Storage may be blocked; the curtain simply plays again next time.
  }
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}
