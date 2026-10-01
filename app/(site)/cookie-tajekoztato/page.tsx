import type { Metadata } from 'next';
import { ConsentSettingsButton } from '@/components/consent/consent-settings-button';
import { LegalLayout } from '@/components/legal/legal-layout';
import { Markdown } from '@/components/legal/markdown';
import { buttonVariants } from '@/components/ui/button';
import { getSettings } from '@/lib/content/settings';
import { pageMetadata } from '@/lib/seo/metadata';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Cookie tájékoztató',
    description:
      'Milyen sütiket használ a Kapucinus Kávézó weboldala, és hogyan módosíthatod a beállításaidat.',
    canonical: '/cookie-tajekoztato',
  });
}

export default function CookiePolicyPage() {
  const legal = getSettings('legal');
  return (
    <LegalLayout
      title="Cookie tájékoztató"
      path="/cookie-tajekoztato"
      effectiveDate={legal.effectiveDate}
    >
      <Markdown source={legal.cookies} />
      <ConsentSettingsButton
        className={buttonVariants({ variant: 'secondary', className: 'mt-8' })}
      />
    </LegalLayout>
  );
}
