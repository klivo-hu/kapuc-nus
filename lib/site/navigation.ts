export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export const PRIMARY_NAV: readonly NavLink[] = [
  { href: '/etlap', label: 'Étlap és itallap' },
  { href: '/rolunk', label: 'Rólunk' },
  { href: '/galeria', label: 'Galéria' },
  { href: '/#helyszin', label: 'Helyszín' },
];

export const LEGAL_NAV: readonly NavLink[] = [
  { href: '/adatkezelesi-tajekoztato', label: 'Adatkezelési tájékoztató' },
  { href: '/impresszum', label: 'Impresszum' },
  { href: '/cookie-tajekoztato', label: 'Cookie tájékoztató' },
];

/** Whether a nav link represents the current page (hash links never do). */
export function isCurrent(href: string, pathname: string): boolean {
  if (href.includes('#')) return false;
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
