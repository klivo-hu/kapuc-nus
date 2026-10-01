import { ArrowDown, ArrowUp } from 'lucide-react';
import { moveItemAction } from '@/app/admin/(panel)/shared-actions';
import type { OrderableList } from '@/lib/db/ordering';
import { cn } from '@/lib/cn';

const iconButton =
  'flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-cream-200 disabled:pointer-events-none disabled:opacity-30';

/**
 * Up/down ordering for one row. Plain forms posting to a server action, so ordering works even
 * before (or without) client JavaScript.
 */
export function MoveButtons({
  list,
  id,
  label,
  isFirst,
  isLast,
}: {
  readonly list: OrderableList;
  readonly id: number;
  /** What is being moved, for the screen-reader label. */
  readonly label: string;
  readonly isFirst: boolean;
  readonly isLast: boolean;
}) {
  return (
    <div className="flex">
      <form action={moveItemAction.bind(null, list, id, 'up')}>
        <button type="submit" disabled={isFirst} className={iconButton}>
          <ArrowUp aria-hidden className="size-4" />
          <span className="sr-only">{label} feljebb</span>
        </button>
      </form>
      <form action={moveItemAction.bind(null, list, id, 'down')}>
        <button type="submit" disabled={isLast} className={iconButton}>
          <ArrowDown aria-hidden className="size-4" />
          <span className="sr-only">{label} lejjebb</span>
        </button>
      </form>
    </div>
  );
}

/** A one-click on/off switch for a row flag (active, featured, available). */
export function ToggleButton({
  action,
  on,
  onLabel,
  offLabel,
  subject,
}: {
  readonly action: () => Promise<void>;
  readonly on: boolean;
  readonly onLabel: string;
  readonly offLabel: string;
  readonly subject: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        aria-pressed={on}
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-meta font-medium transition-colors hover:bg-cream-200',
          on ? 'text-forest-700' : 'text-muted',
        )}
      >
        <span
          aria-hidden
          className={cn('size-2 rounded-full', on ? 'bg-forest-600' : 'bg-latte-400')}
        />
        {on ? onLabel : offLabel}
        <span className="sr-only"> – {subject}, kattints a váltáshoz</span>
      </button>
    </form>
  );
}
