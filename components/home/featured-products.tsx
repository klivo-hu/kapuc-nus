import { ArrowRight } from 'lucide-react';
import { Picture } from '@/components/media/picture';
import { Price } from '@/components/menu/price';
import { Reveal } from '@/components/motion/reveal';
import { CoffeeEdge } from '@/components/site/coffee-edge';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { DIETARY_LABELS } from '@/lib/content/dietary';
import type { Product } from '@/lib/content/types';
import { typeset } from '@/lib/format/typeset';

type FeaturedProduct = Product & { categoryName: string };

/**
 * Featured products on a coffee-brown band that rises out of the cream and pours back into it.
 * No boxes: each item is a photograph with its words set beneath it, and on large screens the
 * middle column steps down to break the grid's rhythm. On phones the row becomes a horizontal
 * scroller with the same inset on both edges.
 */
export function FeaturedProducts({ products }: { readonly products: readonly FeaturedProduct[] }) {
  return (
    <section aria-labelledby="kiemelt-cim" className="relative z-10">
      <CoffeeEdge pour="b" side="top" className="-mt-[5vw]" />
      <div className="surface-dark bg-espresso-800 py-section-tight text-cream-100">
        <div className="shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 id="kiemelt-cim" className="text-h1 text-cream-50">
              A vitrinből és a pult mögül
            </h2>
            <p className="mt-5 max-w-[46ch] text-lead text-cream-200">
              {typeset(
                products.length > 0
                  ? 'Amit most a legtöbben kérnek. A teljes kínálat az étlapon és az itallapon vár.'
                  : 'Kávék, torták, szendvicsek és hideg italok: a teljes kínálat az étlapon és az itallapon vár.',
              )}
            </p>
          </div>
          <ButtonLink
            href="/etlap"
            variant="onDarkOutline"
            icon={<ArrowRight className="size-4" />}
            className="self-start md:self-auto"
          >
            Teljes étlap
          </ButtonLink>
        </div>

        {products.length > 0 ? (
          <Reveal
            as="ul"
            mode="item"
            className="mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-[var(--cef-space-gutter)] px-[var(--cef-space-gutter)] pb-4 [scrollbar-color:rgb(var(--cef-color-latte-400-rgb))_transparent] [scrollbar-width:thin] md:mx-auto md:grid md:max-w-container md:grid-cols-2 md:gap-x-8 md:gap-y-14 md:overflow-visible md:pb-0 lg:grid-cols-3 lg:gap-x-10"
          >
            {products.map((product, index) => (
              <li
                key={product.id}
                className={cn(
                  'w-[78vw] max-w-[22rem] shrink-0 snap-start md:w-auto md:max-w-none',
                  index % 3 === 1 && 'lg:mt-16',
                )}
              >
                <article aria-labelledby={`kiemelt-${product.id}`}>
                  {product.image ? (
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                      <Picture
                        image={product.image}
                        alt={product.name}
                        sizes="(min-width: 1024px) 28vw, (min-width: 768px) 44vw, 78vw"
                      />
                    </div>
                  ) : null}
                  <p className="mt-5 text-meta text-latte-300">{product.categoryName}</p>
                  <div className="mt-1 flex items-baseline justify-between gap-4">
                    <h3 id={`kiemelt-${product.id}`} className="text-h3 text-cream-50">
                      {typeset(product.name)}
                    </h3>
                    <Price
                      price={product.price}
                      note={product.priceNote}
                      className="tabular text-small text-cream-100"
                      noteClassName="text-cream-300"
                    />
                  </div>
                  {product.description ? (
                    <p className="mt-2 line-clamp-2 text-small text-cream-300">
                      {typeset(product.description)}
                    </p>
                  ) : null}
                  {product.dietary.length > 0 ? (
                    <p className="mt-2 text-meta text-sage-200">
                      {product.dietary.map((tag) => DIETARY_LABELS[tag]).join(' · ')}
                    </p>
                  ) : null}
                </article>
              </li>
            ))}
          </Reveal>
        ) : null}
      </div>
      <CoffeeEdge pour="a" side="bottom" flipX className="-mb-[5vw]" />
    </section>
  );
}
