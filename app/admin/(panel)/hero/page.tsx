import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DeleteButton } from '@/components/admin/delete-button';
import { Notice, PageHeader } from '@/components/admin/page-header';
import { MoveButtons, ToggleButton } from '@/components/admin/row-controls';
import { Thumb } from '@/components/admin/thumb';
import { ButtonLink } from '@/components/ui/button';
import { listSlides } from '@/lib/content/hero';
import { deleteSlideAction, toggleSlideAction } from './actions';

export const metadata: Metadata = { title: 'Hero slide-ok' };

export default function HeroListPage() {
  const slides = listSlides();
  const visible = slides.filter((slide) => slide.isActive && slide.image).length;

  return (
    <>
      <PageHeader
        title="Hero slide-ok"
        description="A főoldal nyitó képei és szövegei. A felső jelenik meg először; csak az aktív, képpel rendelkező slide-ok látszanak."
        actions={
          <ButtonLink href="/admin/hero/uj" icon={<Plus className="size-4" />}>
            Új slide
          </ButtonLink>
        }
      />
      {visible === 0 ? (
        <Notice tone="warning">
          Jelenleg nincs megjelenő slide, ezért a főoldal egy egyszerű, képek nélküli nyitórészt
          mutat.
        </Notice>
      ) : null}

      {slides.length === 0 ? (
        <div className="rounded-lg bg-cream-50 p-8 text-center shadow-sm">
          <p className="text-body text-muted">Még nincs slide.</p>
          <ButtonLink href="/admin/hero/uj" className="mt-4">
            Az első slide létrehozása
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg bg-cream-50 shadow-sm">
          {slides.map((slide, index) => (
            <li key={slide.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
              <Thumb image={slide.image} className="aspect-[4/5] w-16 shrink-0" />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/hero/${slide.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {slide.title}
                </Link>
                <p className="truncate text-small text-muted">
                  {slide.description || 'Nincs leírás'}
                </p>
                {!slide.image ? (
                  <p className="text-meta font-medium text-warning">
                    Nincs kép, ezért nem jelenik meg.
                  </p>
                ) : null}
              </div>
              <ToggleButton
                action={toggleSlideAction.bind(null, slide.id, !slide.isActive)}
                on={slide.isActive}
                onLabel="Aktív"
                offLabel="Rejtett"
                subject={slide.title}
              />
              <MoveButtons
                list="hero_slides"
                id={slide.id}
                label={slide.title}
                isFirst={index === 0}
                isLast={index === slides.length - 1}
              />
              <DeleteButton
                compact
                action={deleteSlideAction.bind(null, slide.id)}
                label={`${slide.title} törlése`}
                confirmText={`Biztosan törlöd ezt a slide-ot: „${slide.title}”?`}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
