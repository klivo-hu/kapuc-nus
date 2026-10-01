import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/page-header';
import { SlideForm } from '../slide-form';

export const metadata: Metadata = { title: 'Új slide' };

export default function NewSlidePage() {
  return (
    <>
      <PageHeader title="Új slide" back={{ href: '/admin/hero', label: 'Hero slide-ok' }} />
      <SlideForm slide={null} />
    </>
  );
}
