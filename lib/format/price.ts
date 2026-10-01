const HUF = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 });

/** 1290 → "1 290 Ft", with the non-breaking group separator Hungarian typesetting uses. */
export function formatPrice(price: number): string {
  return `${HUF.format(price)}\u00a0Ft`;
}
