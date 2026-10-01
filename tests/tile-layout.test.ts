import { describe, expect, it } from 'vitest';
import { tileClass } from '@/components/gallery/tile-layout';

/** Reads the column/row span a tile class declares at one breakpoint ('' = base, 'md:', 'lg:'). */
function spans(className: string, prefix: '' | 'md:' | 'lg:') {
  const token = (kind: 'col' | 'row') => {
    const match = className
      .split(/\s+/)
      .find((part) => part.startsWith(`${prefix}${kind}-span-`) && (prefix || !part.includes(':')));
    return Number(match?.split('-').at(-1));
  };
  return { cols: token('col'), rows: token('row') };
}

/** CSS grid `grid-auto-flow: dense` auto-placement, simplified to span-only items. */
function place(items: { cols: number; rows: number }[], columns: number): boolean[][] {
  const grid: boolean[][] = [];
  const free = (row: number, col: number, cols: number, rows: number) => {
    for (let r = row; r < row + rows; r++)
      for (let c = col; c < col + cols; c++) if (grid[r]?.[c]) return false;
    return true;
  };
  for (const item of items) {
    let placed = false;
    for (let row = 0; !placed; row++) {
      for (let col = 0; col + item.cols <= columns && !placed; col++) {
        if (!free(row, col, item.cols, item.rows)) continue;
        for (let r = row; r < row + item.rows; r++) {
          grid[r] ??= Array.from({ length: columns }, () => false);
          for (let c = col; c < col + item.cols; c++) grid[r]![c] = true;
        }
        placed = true;
      }
    }
  }
  return grid;
}

describe('gallery tile phrase', () => {
  const breakpoints = [
    { prefix: '' as const, columns: 2 },
    { prefix: 'md:' as const, columns: 6 },
    { prefix: 'lg:' as const, columns: 12 },
  ];

  it.each(breakpoints)(
    'fills whole cycles without holes ($columns columns)',
    ({ prefix, columns }) => {
      const cycles = 3;
      const items = Array.from({ length: 6 * cycles }, (_, index) =>
        spans(tileClass(index), prefix),
      );
      const grid = place(items, columns);
      const holes = grid
        .flatMap((row, r) => row.map((filled, c) => (filled ? null : `${r}:${c}`)))
        .filter(Boolean);
      expect(holes).toEqual([]);
    },
  );
});
