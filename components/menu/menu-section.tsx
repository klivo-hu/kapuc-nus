import { Picture } from '@/components/media/picture';
import { cn } from '@/lib/cn';
import { DIETARY_LABELS } from '@/lib/content/dietary';
import type { MenuSection as MenuSectionData, Product } from '@/lib/content/types';
import { Price } from './price';
import { typeset } from '@/lib/format/typeset';

function MenuItem({ product }: { readonly product: Product }) {
  const unavailable = !product.isAvailable;
  const tags = product.dietary.map((tag) => DIETARY_LABELS[tag]);

  return (
    <li className={cn('border-b border-border py-6 first:pt-0', unavailable && 'text-muted')}>
      <div className="flex items-baseline gap-4">
        <h3 className={cn('font-serif text-h4', unavailable ? 'text-muted' : 'text-foreground')}>
          {typeset(product.name)}
        </h3>
        {product.price !== null ? (
          <>
            <span
              aria-hidden
              className="h-px min-w-6 flex-1 translate-y-[-0.28em] border-b border-dotted border-latte-500/70"
            />
            <Price
              price={product.price}
              note={product.priceNote}
              className="tabular text-body text-foreground"
            />
          </>
        ) : null}
      </div>
      {product.description ? (
        <p className="mt-1.5 max-w-[60ch] text-small text-muted">{typeset(product.description)}</p>
      ) : null}
      {tags.length > 0 || product.allergens || unavailable ? (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-meta">
          {tags.length > 0 ? <span className="text-forest-700">{tags.join(' · ')}</span> : null}
          {product.allergens ? (
            <span className="text-muted">Allergének: {product.allergens}</span>
          ) : null}
          {unavailable ? (
            <span className="font-medium text-mocha-700">Jelenleg nem kapható</span>
          ) : null}
        </p>
      ) : null}
    </li>
  );
}

/**
 * One category of the menu. On large screens the category's photograph and introduction hold
 * the left column while the list scrolls past on the right.
 */
export function MenuSection({ section }: { readonly section: MenuSectionData }) {
  const cover = section.products.find((product) => product.image)?.image ?? null;
  const coverAlt = section.products.find((product) => product.image)?.name ?? section.name;

  return (
    <section
      id={section.slug}
      aria-labelledby={`${section.slug}-cim`}
      className="scroll-mt-[calc(var(--cef-space-nav)+var(--cef-space-nav-offset)*2+4rem)] border-t border-border py-[clamp(3.5rem,7vw,6.5rem)] first:border-t-0"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--cef-space-nav)+var(--cef-space-nav-offset)*2+5rem)]">
            <h2 id={`${section.slug}-cim`} className="text-h2 text-foreground">
              {section.name}
            </h2>
            {section.description ? (
              <p className="mt-4 max-w-[36ch] text-body text-muted">{section.description}</p>
            ) : null}
            {cover ? (
              <div className="relative mt-8 hidden aspect-[4/5] max-w-sm overflow-hidden rounded-xl lg:block">
                <Picture image={cover} alt={coverAlt} sizes="(min-width: 1024px) 26vw, 100vw" />
              </div>
            ) : null}
          </div>
        </div>
        <ul className="lg:col-span-7 lg:col-start-6">
          {section.products.map((product) => (
            <MenuItem key={product.id} product={product} />
          ))}
        </ul>
      </div>
    </section>
  );
}
