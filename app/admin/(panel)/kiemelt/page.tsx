import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/admin/page-header';
import { MoveButtons, ToggleButton } from '@/components/admin/row-controls';
import { Thumb } from '@/components/admin/thumb';
import { listProducts } from '@/lib/content/menu';
import { toggleProductAction } from '../termekek/actions';

export const metadata: Metadata = { title: 'Kiemelt termékek' };

export default function FeaturedPage() {
  const featured = listProducts()
    .filter((product) => product.isFeatured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder || a.id - b.id);

  return (
    <>
      <PageHeader
        title="Kiemelt termékek"
        description="A főoldal „A vitrinből és a pult mögül” szekciója, ebben a sorrendben. Kiemelni a termék szerkesztésénél vagy a terméklistában lehet; csak a kapható termékek jelennek meg."
      />
      <ul className="divide-y divide-border rounded-lg bg-cream-50 shadow-sm">
        {featured.map((product, index) => (
          <li key={product.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
            <Thumb image={product.image} className="aspect-[4/5] w-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/termekek/${product.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {product.name}
              </Link>
              {!product.isAvailable ? (
                <p className="text-meta font-medium text-warning">
                  Nem kapható, ezért most nem jelenik meg.
                </p>
              ) : null}
              {!product.image ? (
                <p className="text-meta text-muted">Nincs képe; kép nélkül jelenik meg.</p>
              ) : null}
            </div>
            <ToggleButton
              action={toggleProductAction.bind(null, product.id, 'featured', false)}
              on
              onLabel="Kiemelt"
              offLabel="Nem kiemelt"
              subject={product.name}
            />
            <MoveButtons
              list="featured_products"
              id={product.id}
              label={product.name}
              isFirst={index === 0}
              isLast={index === featured.length - 1}
            />
          </li>
        ))}
        {featured.length === 0 ? (
          <li className="p-6 text-small text-muted">
            Nincs kiemelt termék. A főoldalon ilyenkor egy rövid ajánló jelenik meg az étlap felé.
          </li>
        ) : null}
      </ul>
    </>
  );
}
