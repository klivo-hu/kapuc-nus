'use client';

import {
  ArrowUpRight,
  Coffee,
  Images,
  LayoutDashboard,
  LayoutList,
  LogOut,
  MapPin,
  Menu,
  PanelsTopLeft,
  Scale,
  Settings,
  Share2,
  Star,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ComponentType } from 'react';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: '', items: [{ href: '/admin', label: 'Áttekintés', icon: LayoutDashboard }] },
  {
    title: 'Tartalom',
    items: [
      { href: '/admin/hero', label: 'Hero slide-ok', icon: PanelsTopLeft },
      { href: '/admin/rolunk', label: 'Rólunk', icon: Users },
      { href: '/admin/galeria', label: 'Galéria', icon: Images },
    ],
  },
  {
    title: 'Étlap',
    items: [
      { href: '/admin/termekek', label: 'Termékek', icon: Coffee },
      { href: '/admin/kategoriak', label: 'Kategóriák', icon: LayoutList },
      { href: '/admin/kiemelt', label: 'Kiemelt termékek', icon: Star },
    ],
  },
  {
    title: 'Elérhetőség',
    items: [
      { href: '/admin/helyszin', label: 'Helyszín és nyitvatartás', icon: MapPin },
      { href: '/admin/kozossegi', label: 'Közösségi média', icon: Share2 },
    ],
  },
  {
    title: 'Beállítások',
    items: [
      { href: '/admin/beallitasok', label: 'Weboldal és SEO', icon: Settings },
      { href: '/admin/jogi', label: 'Jogi adatok', icon: Scale },
    ],
  },
];

const isActive = (href: string, pathname: string) =>
  href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`);

/** The admin's navigation: a fixed sidebar on large screens, a slide-over on small ones. */
export function AdminNav({ logoutAction }: { readonly logoutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);
  if (navPath !== pathname) {
    setNavPath(pathname);
    setOpen(false);
  }

  const links = (
    <nav aria-label="Admin menü" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
      {GROUPS.map((group) => (
        <div key={group.title || 'root'}>
          {group.title ? (
            <p className="px-3 pb-2 text-meta font-medium text-muted">{group.title}</p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href, pathname);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-small transition-colors',
                      active
                        ? 'bg-cream-200 font-medium text-foreground'
                        : 'text-espresso-800/85 hover:bg-cream-200/60',
                    )}
                  >
                    <Icon aria-hidden className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-border px-3 py-4">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-md px-3 py-2 text-small text-espresso-800/85 hover:bg-cream-200/60"
      >
        <ArrowUpRight aria-hidden className="size-4" />
        Weboldal megtekintése
        <span className="sr-only"> (új lapon nyílik meg)</span>
      </a>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-small text-espresso-800/85 hover:bg-cream-200/60"
        >
          <LogOut aria-hidden className="size-4" />
          Kijelentkezés
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-3 px-6">
      <img
        src="/brand/logo.png"
        width={640}
        height={150}
        alt="Kapucinus Kávézó"
        className="h-7 w-auto"
      />
      <span className="sr-only">admin</span>
    </Link>
  );

  return (
    <>
      {/* Large screens: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-cream-50 lg:flex">
        <div className="flex h-16 items-center border-b border-border">{brand}</div>
        {links}
        {footer}
      </aside>

      {/* Small screens: top bar and slide-over */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-cream-50 pr-2 lg:hidden">
        {brand}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          onClick={() => setOpen((value) => !value)}
          className="flex size-11 items-center justify-center rounded-md hover:bg-cream-200"
        >
          {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          <span className="sr-only">{open ? 'Menü bezárása' : 'Menü megnyitása'}</span>
        </button>
      </div>
      <div
        id="admin-mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-cream-50 lg:hidden"
      >
        {links}
        {footer}
      </div>
    </>
  );
}
