import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/legal-layout';
import { Markdown } from '@/components/legal/markdown';
import { OperatorDetails } from '@/components/legal/operator-details';
import { getSettings } from '@/lib/content/settings';
import { pageMetadata } from '@/lib/seo/metadata';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Adatkezelési tájékoztató',
    description:
      'Milyen adatokat kezel a Kapucinus Kávézó weboldala, milyen célból, és milyen jogaid vannak.',
    canonical: '/adatkezelesi-tajekoztato',
  });
}

export default function PrivacyPage() {
  const operator = getSettings('operator');
  const legal = getSettings('legal');
  return (
    <LegalLayout
      title="Adatkezelési tájékoztató"
      path="/adatkezelesi-tajekoztato"
      effectiveDate={legal.effectiveDate}
    >
      <h2>Adatkezelő</h2>
      <OperatorDetails operator={operator} />
      <Markdown source={legal.privacy} />
    </LegalLayout>
  );
}
