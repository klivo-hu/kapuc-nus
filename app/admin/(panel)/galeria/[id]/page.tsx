import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ActionForm,
  CheckboxField,
  FieldGroup,
  FormFooter,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/admin/form';
import { DeleteButton } from '@/components/admin/delete-button';
import { Notice, PageHeader } from '@/components/admin/page-header';
import { Thumb } from '@/components/admin/thumb';
import { getGalleryItem, listGalleryCategories } from '@/lib/content/gallery';
import { deleteGalleryItemAction, saveGalleryItemAction } from '../actions';

export const metadata: Metadata = { title: 'Galériakép szerkesztése' };

export default async function EditGalleryItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ 'alt-hianyzik'?: string }>;
}) {
  const item = getGalleryItem(Number((await params).id));
  if (!item) notFound();
  const altMissing = (await searchParams)['alt-hianyzik'] === '1';
  const categories = listGalleryCategories();

  return (
    <>
      <PageHeader
        title={item.title || 'Galériakép'}
        back={{ href: '/admin/galeria', label: 'Galéria' }}
        actions={
          <DeleteButton
            action={deleteGalleryItemAction.bind(null, item.id)}
            confirmText="Biztosan törlöd ezt a képet a galériából?"
          />
        }
      />
      {altMissing ? (
        <Notice tone="warning">
          A kép csak alt szöveggel tehető közzé. Írd le röviden, mi látható rajta.
        </Notice>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <Thumb image={item.image} alt={item.alt} className="aspect-[4/5] w-full max-w-xs" />
        <ActionForm action={saveGalleryItemAction.bind(null, item.id)}>
          <FieldGroup title="Adatok">
            <TextField
              name="title"
              label="Cím"
              hint="A nagyító nézetben jelenik meg."
              defaultValue={item.title}
              maxLength={120}
            />
            <TextField
              name="alt"
              label="Alt szöveg"
              hint="Egy mondatban: mi látható a képen? Pl. „Málnás tortaszelet az ablak melletti asztalon”."
              defaultValue={item.alt}
              maxLength={200}
            />
            <TextAreaField
              name="description"
              label="Leírás (nem kötelező)"
              defaultValue={item.description}
              rows={3}
              maxLength={400}
            />
            <SelectField
              name="categoryId"
              label="Kategória"
              defaultValue={item.categoryId ?? ''}
              options={[
                { value: '', label: 'Nincs kategória' },
                ...categories.map((category) => ({ value: category.id, label: category.name })),
              ]}
            />
            <CheckboxField
              name="isActive"
              label="Megjelenik a galériában"
              defaultChecked={item.isActive}
            />
          </FieldGroup>
          <FormFooter />
        </ActionForm>
      </div>
    </>
  );
}
