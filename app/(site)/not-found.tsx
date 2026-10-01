import type { Metadata } from 'next';
import { StatusPage } from '@/components/site/status-page';
import { ButtonLink } from '@/components/ui/button';
import { typeset } from '@/lib/format/typeset';

export const metadata: Metadata = {
  title: 'Az oldal nem található',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <StatusPage
      title="Ez nincs az étlapon"
      actions={
        <>
          <ButtonLink href="/">Vissza a főoldalra</ButtonLink>
          <ButtonLink href="/etlap" variant="secondary">
            Étlap és itallap
          </ButtonLink>
        </>
      }
    >
      <p>
        {typeset(
          'A keresett oldalt nem találjuk. Lehet, hogy elköltözött, vagy elírás történt a címben.',
        )}
      </p>
    </StatusPage>
  );
}
