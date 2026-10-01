import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ActionForm,
  CheckboxField,
  FieldGroup,
  FormFooter,
  TextAreaField,
  TextField,
} from '@/components/admin/form';
import { DeleteButton } from '@/components/admin/delete-button';
import { PageHeader } from '@/components/admin/page-header';
import { getCategory } from '@/lib/content/menu';
import { deleteCategoryAction, updateCategoryAction } from '../actions';

export const metadata: Metadata = { title: 'Kategória szerkesztése' };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const category = getCategory(Number((await params).id));
  if (!category) notFound();

  return (
    <>
      <PageHeader
        title={category.name}
        back={{ href: '/admin/kategoriak', label: 'Kategóriák' }}
        actions={
          <DeleteButton
            action={deleteCategoryAction.bind(null, category.id)}
            confirmText={`Biztosan törlöd a(z) „${category.name}” kategóriát?`}
          />
        }
      />
      <ActionForm action={updateCategoryAction.bind(null, category.id)}>
        <FieldGroup title="Kategória">
          <TextField name="name" label="Név" defaultValue={category.name} maxLength={60} required />
          <TextAreaField
            name="description"
            label="Rövid leírás"
            hint="Az étlapon a kategória címe alatt jelenik meg."
            defaultValue={category.description}
            rows={3}
            maxLength={300}
          />
          <CheckboxField
            name="isActive"
            label="Látható az étlapon"
            defaultChecked={category.isActive}
          />
        </FieldGroup>
        <FormFooter />
      </ActionForm>
    </>
  );
}
