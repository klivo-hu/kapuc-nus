import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { listCategories } from '@/lib/content/menu';
import { ProductForm } from '../product-form';

export const metadata: Metadata = { title: 'Új termék' };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ kategoria?: string }>;
}) {
  const categories = listCategories();
  if (categories.length === 0) redirect('/admin/kategoriak');
  const requested = Number((await searchParams).kategoria);

  return (
    <>
      <PageHeader title="Új termék" back={{ href: '/admin/termekek', label: 'Termékek' }} />
      <ProductForm
        product={null}
        categories={categories}
        defaultCategoryId={
          categories.some((category) => category.id === requested) ? requested : undefined
        }
      />
    </>
  );
}
