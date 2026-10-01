import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/admin/delete-button';
import { Notice, PageHeader } from '@/components/admin/page-header';
import { getSlide } from '@/lib/content/hero';
import { deleteSlideAction } from '../actions';
import { SlideForm } from '../slide-form';

export const metadata: Metadata = { title: 'Slide szerkesztése' };

export default async function EditSlidePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ letrehozva?: string }>;
}) {
  const slide = getSlide(Number((await params).id));
  if (!slide) notFound();
  const created = (await searchParams).letrehozva === '1';

  return (
    <>
      <PageHeader
        title={slide.title}
        back={{ href: '/admin/hero', label: 'Hero slide-ok' }}
        actions={
          <DeleteButton
            action={deleteSlideAction.bind(null, slide.id)}
            confirmText={`Biztosan törlöd ezt a slide-ot: „${slide.title}”?`}
          />
        }
      />
      {created ? <Notice>A slide elkészült.</Notice> : null}
      <SlideForm slide={slide} />
    </>
  );
}
