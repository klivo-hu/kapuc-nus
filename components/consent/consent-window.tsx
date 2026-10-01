'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useConsent } from '@/components/consent/consent-provider';
import {
  CONSENT_COPY,
  CONSENT_POLICY_PATH,
  CONSENT_SHOW_PURPOSES_UP_FRONT,
  OPTIONAL_CATEGORIES,
  allGranted,
  defaultGrants,
} from '@/lib/consent/config';
import { useIntroSettled } from '@/lib/motion/intro';
import { typeset } from '@/lib/format/typeset';

/**
 * The consent window.
 *
 * It renders only when no current decision exists, or when the visitor reopens it — and never
 * underneath the intro curtain. Accept and reject are the same control size and sit side by side,
 * because a reject button that is quieter than accept is a dark pattern rather than a style
 * choice. On small screens it sits above the fixed action dock instead of covering it.
 */
export function ConsentWindow() {
  const { ready, decided, open, grants, save, close } = useConsent();
  const introSettled = useIntroSettled();
  const [purposesVisible, setPurposesVisible] = useState(CONSENT_SHOW_PURPOSES_UP_FRONT);
  const [draft, setDraft] = useState<Record<string, boolean>>(defaultGrants);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  const visible = ready && introSettled && (open || !decided);

  // The draft mirrors the stored decision each time the window opens, so reopening shows what is
  // currently allowed rather than a fresh set of defaults.
  useEffect(() => {
    if (visible) setDraft({ ...grants });
  }, [visible, grants]);

  // Escape closes without granting anything. Closing an undecided window leaves consent absent,
  // which is the correct state: silence is not agreement.
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible, close]);

  // Focus enters the window when it appears, so keyboard and screen-reader users reach the choice
  // rather than tabbing through the page to find it.
  useEffect(() => {
    if (visible) dialogRef.current?.focus({ preventScroll: true });
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal={false}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      tabIndex={-1}
      className="fixed inset-x-3 bottom-[calc(var(--cef-space-dock,0px)+0.75rem)] z-50 max-h-[calc(100svh-7rem)] overflow-y-auto rounded-lg bg-cream-50 p-6 shadow-lg motion-safe:animate-[fade-in_300ms_var(--cef-ease-decelerate)] sm:inset-x-auto sm:right-5 sm:max-w-[26rem] lg:bottom-5"
    >
      <h2 id={titleId} className="font-serif text-h4 text-foreground">
        {CONSENT_COPY.title}
      </h2>
      <p id={bodyId} className="mt-2 text-small text-muted">
        {typeset(CONSENT_COPY.body)}
      </p>

      {purposesVisible ? (
        <fieldset className="mt-5 space-y-4 border-t border-border pt-5">
          <legend className="sr-only">{CONSENT_COPY.preferencesTitle}</legend>
          <p className="text-small text-muted">{typeset(CONSENT_COPY.preferencesBody)}</p>
          {OPTIONAL_CATEGORIES.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer gap-3 text-small text-foreground"
            >
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-[rgb(var(--cef-color-mocha-700-rgb))]"
                checked={draft[category.id] === true}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, [category.id]: event.target.checked }))
                }
              />
              <span>
                <span className="font-medium">{category.label}</span>
                <span className="mt-0.5 block text-muted">{typeset(category.description)}</span>
              </span>
            </label>
          ))}
        </fieldset>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <Button variant="primary" size="sm" onClick={() => save(allGranted())}>
          {CONSENT_COPY.acceptAll}
        </Button>
        <Button variant="primary" size="sm" onClick={() => save(defaultGrants())}>
          {CONSENT_COPY.rejectAll}
        </Button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        {purposesVisible ? (
          <Button variant="ghost" size="sm" className="-ml-3" onClick={() => save(draft)}>
            {CONSENT_COPY.save}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => setPurposesVisible(true)}
          >
            {CONSENT_COPY.customize}
          </Button>
        )}
        <Link href={CONSENT_POLICY_PATH} className="text-small text-foreground underline">
          {CONSENT_COPY.policyLink}
        </Link>
      </div>
    </div>
  );
}
