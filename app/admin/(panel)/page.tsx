import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CircleCheck, CircleDot } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { listGallery } from '@/lib/content/gallery';
import { listSlides } from '@/lib/content/hero';
import { listCategories, listProducts } from '@/lib/content/menu';
import { getAllSettings } from '@/lib/content/settings';
import { env } from '@/lib/env';
import { publishedHours } from '@/lib/format/location';
import { socialLinks } from '@/lib/site/social';

export const metadata: Metadata = { title: 'Áttekintés' };

interface Task {
  done: boolean;
  label: string;
  detail: string;
  href: string;
}

export default function DashboardPage() {
  const settings = getAllSettings();
  const slides = listSlides();
  const products = listProducts();
  const gallery = listGallery({ activeOnly: false });
  const categories = listCategories();
  const missingPrices = products.filter((product) => product.price === null).length;
  const galleryWithoutAlt = gallery.filter((item) => item.alt.trim().length < 3).length;

  const tasks: Task[] = [
    {
      done: settings.location.street !== '',
      label: 'Pontos cím',
      detail: 'Utca és házszám a helyszínhez, a láblécbe és a keresőknek.',
      href: '/admin/helyszin',
    },
    {
      done: publishedHours(settings.location) !== null,
      label: 'Nyitvatartás',
      detail: 'Mind a hét nap kitöltve, különben nem jelenik meg.',
      href: '/admin/helyszin',
    },
    {
      done: settings.location.phone !== '' || settings.location.email !== '',
      label: 'Telefonszám vagy e-mail',
      detail: 'Hogy a vendégek elérjenek.',
      href: '/admin/helyszin',
    },
    {
      done: missingPrices === 0,
      label: 'Árak',
      detail:
        missingPrices > 0 ? `${missingPrices} terméknél nincs ár.` : 'Minden terméknek van ára.',
      href: '/admin/termekek',
    },
    {
      done: socialLinks(settings.social).length > 0,
      label: 'Közösségi média',
      detail: 'Instagram, Facebook vagy TikTok cím a „Kövess minket” szekcióhoz.',
      href: '/admin/kozossegi',
    },
    {
      done: !settings.aboutPage.teamImage.id?.startsWith('seed-'),
      label: 'Csapatfotó',
      detail:
        'A Rólunk oldalon most egy felszolgálás közbeni fotó szerepel; ide valódi csapatkép illik.',
      href: '/admin/rolunk',
    },
    {
      done: galleryWithoutAlt === 0,
      label: 'Galéria alt szövegek',
      detail:
        galleryWithoutAlt > 0
          ? `${galleryWithoutAlt} kép vár leírásra.`
          : 'Minden képnek van leírása.',
      href: '/admin/galeria',
    },
    {
      done: settings.operator.companyName !== '' && settings.legal.effectiveDate !== '',
      label: 'Jogi adatok',
      detail: 'Üzemeltető adatai és a tájékoztatók hatálya (a szövegeket jogász nézze át).',
      href: '/admin/jogi',
    },
  ];
  const open = tasks.filter((task) => !task.done);

  const stats = [
    {
      label: 'Aktív slide',
      value: slides.filter((slide) => slide.isActive && slide.image).length,
      href: '/admin/hero',
    },
    { label: 'Termék', value: products.length, href: '/admin/termekek' },
    { label: 'Kategória', value: categories.length, href: '/admin/kategoriak' },
    {
      label: 'Kiemelt termék',
      value: products.filter((product) => product.isFeatured).length,
      href: '/admin/kiemelt',
    },
    {
      label: 'Galériakép',
      value: gallery.filter((item) => item.isActive).length,
      href: '/admin/galeria',
    },
  ];

  return (
    <>
      <PageHeader
        title="Áttekintés"
        description="A weboldal tartalma egy helyen. Minden mentés azonnal megjelenik a weboldalon."
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link
              href={stat.href}
              className="block rounded-lg bg-cream-50 p-4 shadow-sm transition-colors hover:bg-cream-200"
            >
              <span className="tabular block font-serif text-h2 text-foreground">{stat.value}</span>
              <span className="text-small text-muted">{stat.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="teendok" className="mt-10">
        <h2 id="teendok" className="font-serif text-h3 text-foreground">
          {open.length > 0 ? `Még hiányzik (${open.length})` : 'Minden fontos adat megvan'}
        </h2>
        <p className="mt-1 text-small text-muted">
          Ezeket az adatokat nem találtuk ki: amíg nincsenek megadva, a weboldal egyszerűen nem
          mutatja őket.
        </p>
        <ul className="mt-5 divide-y divide-border rounded-lg bg-cream-50 shadow-sm">
          {[...open, ...tasks.filter((task) => task.done)].map((task) => (
            <li key={task.label}>
              <Link
                href={task.href}
                className="group flex items-start gap-4 p-4 transition-colors hover:bg-cream-200/60"
              >
                {task.done ? (
                  <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-forest-600" />
                ) : (
                  <CircleDot aria-hidden className="mt-0.5 size-5 shrink-0 text-warning" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">
                    {task.label}
                    <span className="sr-only">{task.done ? ' – kész' : ' – hiányzik'}</span>
                  </span>
                  <span className="block text-small text-muted">{task.detail}</span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="mt-1 size-4 text-muted transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {env.isProduction && env.siteUrl.includes('localhost') ? (
        <p className="mt-8 rounded-md bg-[rgb(var(--cef-danger-rgb)/0.08)] px-4 py-3 text-small text-danger">
          A SITE_URL környezeti változó nincs beállítva, ezért a keresőknek szóló linkek hibásak
          lesznek.
        </p>
      ) : null}
    </>
  );
}
