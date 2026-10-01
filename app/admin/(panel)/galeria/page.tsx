import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, FormFooter, TextField } from '@/components/admin/form';
import { DeleteButton } from '@/components/admin/delete-button';
import { GalleryUploader } from '@/components/admin/gallery-uploader';
import { Notice, PageHeader } from '@/components/admin/page-header';
import { MoveButtons, ToggleButton } from '@/components/admin/row-controls';
import { Thumb } from '@/components/admin/thumb';
import { listGallery, listGalleryCategories } from '@/lib/content/gallery';
import { env } from '@/lib/env';
import {
  createGalleryCategoryAction,
  deleteGalleryCategoryAction,
  deleteGalleryItemAction,
  renameGalleryCategoryAction,
  toggleGalleryItemAction,
} from './actions';

export const metadata: Metadata = { title: 'Galéria' };

export default function GalleryAdminPage() {
  const items = listGallery({ activeOnly: false });
  const categories = listGalleryCategories();
  const waiting = items.filter((item) => !item.isActive && item.alt.trim().length < 3).length;

  return (
    <>
      <PageHeader
        title="Galéria"
        description="A galéria oldal képei, ebben a sorrendben. A rejtett képek nem jelennek meg a weboldalon."
      />
      {waiting > 0 ? (
        <Notice tone="warning">
          {waiting} kép vár leírásra (alt szöveg). Nyisd meg őket, írd le, mi látható rajtuk, és
          kapcsold be a megjelenést.
        </Notice>
      ) : null}

      <GalleryUploader maxBytes={env.maxUploadBytes} />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const category = categories.find((entry) => entry.id === item.categoryId);
          const needsAlt = item.alt.trim().length < 3;
          return (
            <li key={item.id} className="overflow-hidden rounded-lg bg-cream-50 shadow-sm">
              <Link href={`/admin/galeria/${item.id}`} className="block">
                <Thumb
                  image={item.image}
                  alt={item.alt}
                  className="aspect-[4/3] w-full rounded-none"
                />
              </Link>
              <div className="space-y-1 p-4">
                <Link
                  href={`/admin/galeria/${item.id}`}
                  className="block truncate font-medium text-foreground hover:underline"
                >
                  {item.title || 'Cím nélkül'}
                </Link>
                <p className="text-meta text-muted">{category?.name ?? 'Nincs kategória'}</p>
                {needsAlt ? (
                  <p className="text-meta font-medium text-warning">Hiányzik az alt szöveg</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-2">
                <ToggleButton
                  action={toggleGalleryItemAction.bind(null, item.id, !item.isActive)}
                  on={item.isActive}
                  onLabel="Látható"
                  offLabel="Rejtett"
                  subject={item.title || item.alt || 'kép'}
                />
                <div className="flex items-center">
                  <MoveButtons
                    list="gallery_items"
                    id={item.id}
                    label={item.title || 'kép'}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                  />
                  <DeleteButton
                    compact
                    action={deleteGalleryItemAction.bind(null, item.id)}
                    label={`${item.title || 'kép'} törlése`}
                    confirmText="Biztosan törlöd ezt a képet a galériából?"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {items.length === 0 ? (
        <p className="mt-6 text-small text-muted">A galéria üres. Tölts fel képeket fent.</p>
      ) : null}

      <section
        aria-labelledby="galeria-kategoriak"
        className="mt-12 rounded-lg bg-cream-50 p-6 shadow-sm"
      >
        <h2 id="galeria-kategoriak" className="font-serif text-h4 text-foreground">
          Galéria kategóriák
        </h2>
        <p className="mt-1 text-small text-muted">
          A galéria oldalon szűrőként jelennek meg. Törléskor a képek megmaradnak, kategória nélkül.
        </p>
        <ul className="mt-5 space-y-3">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-end gap-3">
              <ActionForm
                action={renameGalleryCategoryAction.bind(null, category.id)}
                className="flex flex-1 flex-wrap items-end gap-3 space-y-0"
              >
                <TextField
                  name="name"
                  label="Név"
                  defaultValue={category.name}
                  maxLength={40}
                  className="min-w-[12rem] flex-1"
                />
                <FormFooter submitLabel="Átnevezés" inline />
              </ActionForm>
              <DeleteButton
                compact
                action={deleteGalleryCategoryAction.bind(null, category.id)}
                label={`${category.name} kategória törlése`}
                confirmText={`Biztosan törlöd a(z) „${category.name}” kategóriát? A képek megmaradnak.`}
              />
            </li>
          ))}
        </ul>
        <ActionForm
          action={createGalleryCategoryAction}
          className="mt-6 flex flex-wrap items-end gap-3 space-y-0 border-t border-border pt-6"
        >
          <TextField
            name="name"
            label="Új kategória"
            maxLength={40}
            className="min-w-[12rem] flex-1"
          />
          <FormFooter submitLabel="Hozzáadás" inline />
        </ActionForm>
      </section>
    </>
  );
}
