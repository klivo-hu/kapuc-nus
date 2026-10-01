import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DeleteButton } from '@/components/admin/delete-button';
import { Notice, PageHeader } from '@/components/admin/page-header';
import { MoveButtons, ToggleButton } from '@/components/admin/row-controls';
import { Thumb } from '@/components/admin/thumb';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { listCategories, listProducts } from '@/lib/content/menu';
import { formatPrice } from '@/lib/format/price';
import { deleteProductAction, toggleProductAction } from './actions';

export const metadata: Metadata = { title: 'Termékek' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategoria?: string }>;
}) {
  const categories = listCategories();
  const requested = Number((await searchParams).kategoria);
  const selected = categories.find((category) => category.id === requested) ?? null;
  const products = listProducts(selected?.id);
  const missingPrices = products.filter((product) => product.price === null).length;

  return (
    <>
      <PageHeader
        title="Termékek"
        description="Az étlap és az itallap tételei. A sorrend kategórián belül érvényes."
        actions={
          categories.length > 0 ? (
            <ButtonLink
              href={selected ? `/admin/termekek/uj?kategoria=${selected.id}` : '/admin/termekek/uj'}
              icon={<Plus className="size-4" />}
            >
              Új termék
            </ButtonLink>
          ) : null
        }
      />

      {categories.length === 0 ? (
        <Notice tone="warning">
          Termék felvételéhez előbb hozz létre egy{' '}
          <Link href="/admin/kategoriak" className="underline">
            kategóriát
          </Link>
          .
        </Notice>
      ) : null}
      {missingPrices > 0 ? (
        <Notice tone="warning">
          {missingPrices} terméknél nincs ár megadva. Ezeknél az étlapon nem jelenik meg ár.
        </Notice>
      ) : null}

      <nav aria-label="Szűrés kategóriára" className="mb-5 flex flex-wrap gap-2">
        {[{ id: 0, name: 'Összes' }, ...categories].map((category) => {
          const active = (selected?.id ?? 0) === category.id;
          return (
            <Link
              key={category.id}
              href={category.id ? `/admin/termekek?kategoria=${category.id}` : '/admin/termekek'}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 text-small transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-cream-50 text-foreground hover:bg-cream-200',
              )}
            >
              {category.name}
            </Link>
          );
        })}
      </nav>

      <ul className="divide-y divide-border rounded-lg bg-cream-50 shadow-sm">
        {products.map((product) => {
          const category = categories.find((item) => item.id === product.categoryId);
          const siblings = products.filter((item) => item.categoryId === product.categoryId);
          const position = siblings.indexOf(product);
          return (
            <li key={product.id} className="flex flex-wrap items-center gap-4 p-4 md:flex-nowrap">
              <Thumb image={product.image} className="aspect-square w-14 shrink-0" />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/termekek/${product.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {product.name}
                </Link>
                <p className="text-small text-muted">
                  {category?.name} ·{' '}
                  {product.price !== null ? (
                    <span className="tabular">{formatPrice(product.price)}</span>
                  ) : (
                    <span className="text-warning">nincs ár</span>
                  )}
                </p>
              </div>
              <ToggleButton
                action={toggleProductAction.bind(
                  null,
                  product.id,
                  'available',
                  !product.isAvailable,
                )}
                on={product.isAvailable}
                onLabel="Kapható"
                offLabel="Nem kapható"
                subject={product.name}
              />
              <ToggleButton
                action={toggleProductAction.bind(null, product.id, 'featured', !product.isFeatured)}
                on={product.isFeatured}
                onLabel="Kiemelt"
                offLabel="Nem kiemelt"
                subject={product.name}
              />
              <MoveButtons
                list="products"
                id={product.id}
                label={product.name}
                isFirst={position === 0}
                isLast={position === siblings.length - 1}
              />
              <DeleteButton
                compact
                action={deleteProductAction.bind(null, product.id)}
                label={`${product.name} törlése`}
                confirmText={`Biztosan törlöd: „${product.name}”?`}
              />
            </li>
          );
        })}
        {products.length === 0 ? (
          <li className="p-6 text-small text-muted">Ebben a nézetben nincs termék.</li>
        ) : null}
      </ul>
    </>
  );
}
