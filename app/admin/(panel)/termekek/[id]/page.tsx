import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/admin/delete-button';
import { Notice, PageHeader } from '@/components/admin/page-header';
import { getProduct, listCategories } from '@/lib/content/menu';
import { deleteProductAction } from '../actions';
import { ProductForm } from '../product-form';

export const metadata: Metadata = { title: 'Termék szerkesztése' };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ letrehozva?: string }>;
}) {
  const product = getProduct(Number((await params).id));
  if (!product) notFound();
  const created = (await searchParams).letrehozva === '1';

  return (
    <>
      <PageHeader
        title={product.name}
        back={{ href: '/admin/termekek', label: 'Termékek' }}
        actions={
          <DeleteButton
            action={deleteProductAction.bind(null, product.id)}
            confirmText={`Biztosan törlöd: „${product.name}”?`}
          />
        }
      />
      {created ? <Notice>A termék elkészült.</Notice> : null}
      <ProductForm product={product} categories={listCategories()} />
    </>
  );
}
