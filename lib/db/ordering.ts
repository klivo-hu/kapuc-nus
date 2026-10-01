import 'server-only';
import { db } from './client';

/**
 * Manual ordering for admin lists. Each orderable table is named here with its order column and
 * the column that scopes an ordering (products are ordered within their category), so no table
 * or column name ever comes from a request.
 */
const ORDERABLE = {
  hero_slides: { column: 'sort_order', scope: null },
  menu_categories: { column: 'sort_order', scope: null },
  products: { column: 'sort_order', scope: 'category_id' },
  featured_products: { column: 'featured_order', scope: null },
  gallery_items: { column: 'sort_order', scope: null },
  gallery_categories: { column: 'sort_order', scope: null },
} as const;

export type OrderableList = keyof typeof ORDERABLE;
export type MoveDirection = 'up' | 'down' | 'first' | 'last';

const tableOf = (list: OrderableList) => (list === 'featured_products' ? 'products' : list);

/**
 * Moves one row within its list and renumbers the list 0..n-1, so gaps and duplicate positions
 * left by deletes or imports never accumulate.
 */
export function moveRow(list: OrderableList, id: number, direction: MoveDirection): void {
  const { column, scope } = ORDERABLE[list];
  const table = tableOf(list);
  const database = db();

  database.transaction(() => {
    const scopeValue = scope
      ? (database.prepare(`SELECT ${scope} AS value FROM ${table} WHERE id = ?`).get(id) as
          { value: number } | undefined)
      : undefined;
    if (scope && scopeValue === undefined) return;

    const filters: string[] = [];
    if (scope) filters.push(`${scope} = @scope`);
    if (list === 'featured_products') filters.push('is_featured = 1');
    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const ids = (
      database
        .prepare(`SELECT id FROM ${table} ${where} ORDER BY ${column}, id`)
        .all({ scope: scopeValue?.value }) as { id: number }[]
    ).map((row) => row.id);

    const from = ids.indexOf(id);
    if (from === -1) return;
    const to =
      direction === 'up'
        ? Math.max(0, from - 1)
        : direction === 'down'
          ? Math.min(ids.length - 1, from + 1)
          : direction === 'first'
            ? 0
            : ids.length - 1;
    ids.splice(from, 1);
    ids.splice(to, 0, id);

    const update = database.prepare(`UPDATE ${table} SET ${column} = ? WHERE id = ?`);
    ids.forEach((rowId, index) => update.run(index, rowId));
  })();
}

/** The position a new row takes: after everything already in its list. */
export function nextPosition(list: OrderableList, scopeValue?: number): number {
  const { column, scope } = ORDERABLE[list];
  const table = tableOf(list);
  const where = scope ? `WHERE ${scope} = ?` : '';
  const row = db()
    .prepare(`SELECT COALESCE(MAX(${column}), -1) + 1 AS next FROM ${table} ${where}`)
    .get(...(scope ? [scopeValue] : [])) as { next: number };
  return row.next;
}
