import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal/legal-layout';
import { Markdown } from '@/components/legal/markdown';
import { OperatorDetails } from '@/components/legal/operator-details';
import { getSettings } from '@/lib/content/settings';
import { pageMetadata } from '@/lib/seo/metadata';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Impresszum',
    description:
      'A Kapucinus Kávézó weboldalának üzemeltetője, elérhetőségei és tárhelyszolgáltatója.',
    canonical: '/impresszum',
  });
}

export default function ImpressumPage() {
  const operator = getSettings('operator');
  const legal = getSettings('legal');
  return (
    <LegalLayout title="Impresszum" path="/impresszum" effectiveDate={legal.effectiveDate}>
      <OperatorDetails operator={operator} includeHosting />
      {legal.impressumNote ? <Markdown source={legal.impressumNote} /> : null}
    </LegalLayout>
  );
}
