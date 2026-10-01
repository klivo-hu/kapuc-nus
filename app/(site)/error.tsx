'use client';

import { useEffect } from 'react';
import { StatusPage } from '@/components/site/status-page';
import { Button, ButtonLink } from '@/components/ui/button';
import { typeset } from '@/lib/format/typeset';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Logged so the failure is visible in the server and browser logs, not swallowed.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      title="Valami félrecsúszott"
      actions={
        <>
          <Button onClick={reset}>Újrapróbálom</Button>
          <ButtonLink href="/" variant="secondary">
            Vissza a főoldalra
          </ButtonLink>
        </>
      }
    >
      <p>{typeset('Az oldalt most nem sikerült betölteni. Próbáld újra egy pillanat múlva.')}</p>
    </StatusPage>
  );
}
