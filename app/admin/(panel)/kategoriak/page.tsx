import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm, CheckboxField, FormFooter, TextField } from '@/components/admin/form';
import { DeleteButton } from '@/components/admin/delete-button';
import { Notice, PageHeader } from '@/components/admin/page-header';
import { MoveButtons, ToggleButton } from '@/components/admin/row-controls';
import { listCategories } from '@/lib/content/menu';
import { createCategoryAction, deleteCategoryAction, toggleCategoryAction } from './actions';

export const metadata: Metadata = { title: 'Kategóriák' };

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ 'nem-torolheto'?: string }>;
}) {
  const categories = listCategories();
  const blocked = (await searchParams)['nem-torolheto'];

  return (
    <>
      <PageHeader
        title="Kategóriák"
        description="Az étlap és az itallap fejezetei, ebben a sorrendben. A rejtett kategória termékei nem jelennek meg."
      />
      {blocked ? (
        <Notice tone="warning">
          Ez a kategória nem törölhető, mert {blocked} termék tartozik hozzá. Előbb helyezd át vagy
          töröld őket.
        </Notice>
      ) : null}

      <ul className="divide-y divide-border rounded-lg bg-cream-50 shadow-sm">
        {categories.map((category, index) => (
          <li key={category.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/kategoriak/${category.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {category.name}
              </Link>
              <p className="text-small text-muted">
                <Link href={`/admin/termekek?kategoria=${category.id}`} className="hover:underline">
                  {category.productCount} termék
                </Link>
              </p>
            </div>
            <ToggleButton
              action={toggleCategoryAction.bind(null, category.id, !category.isActive)}
              on={category.isActive}
              onLabel="Látható"
              offLabel="Rejtett"
              subject={category.name}
            />
            <MoveButtons
              list="menu_categories"
              id={category.id}
              label={category.name}
              isFirst={index === 0}
              isLast={index === categories.length - 1}
            />
            <DeleteButton
              compact
              action={deleteCategoryAction.bind(null, category.id)}
              label={`${category.name} törlése`}
              confirmText={`Biztosan törlöd a(z) „${category.name}” kategóriát?`}
            />
          </li>
        ))}
        {categories.length === 0 ? (
          <li className="p-6 text-small text-muted">Még nincs kategória.</li>
        ) : null}
      </ul>

      <section
        aria-labelledby="uj-kategoria"
        className="mt-10 rounded-lg bg-cream-50 p-6 shadow-sm"
      >
        <h2 id="uj-kategoria" className="font-serif text-h4 text-foreground">
          Új kategória
        </h2>
        <ActionForm action={createCategoryAction} className="mt-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label="Név" maxLength={60} required />
            <TextField name="description" label="Rövid leírás" maxLength={300} />
          </div>
          <CheckboxField name="isActive" label="Látható az étlapon" defaultChecked />
          <FormFooter submitLabel="Kategória hozzáadása" inline />
        </ActionForm>
      </section>
    </>
  );
}
