import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format/price';

/**
 * A price with its optional unit ("1 290 Ft / szelet"). Renders nothing until a price is set.
 * The unit is quieter than the price; on a dark surface pass a light `noteClassName`.
 */
export function Price({
  price,
  note,
  className,
  noteClassName = 'text-muted',
}: {
  readonly price: number | null;
  readonly note?: string;
  readonly className?: string;
  readonly noteClassName?: string;
}) {
  if (price === null) return null;
  return (
    <span className={cn('whitespace-nowrap', className)}>
      <data value={price}>{formatPrice(price)}</data>
      {note ? <span className={noteClassName}> / {note}</span> : null}
    </span>
  );
}
