import Link from 'next/link';
import type { ReactNode } from 'react';
import { typeset } from '@/lib/format/typeset';

interface PageIntroProps {
  readonly title: string;
  readonly lead?: string;
  /** A short handwritten aside, set beside the lead. */
  readonly note?: string;
  /** The page's place in the site, shown as a breadcrumb (it mirrors the BreadcrumbList data). */
  readonly crumb: string;
  readonly children?: ReactNode;
}

/** The opening of every inner page: breadcrumb, a large heading, and the lead. */
export function PageIntro({ title, lead, note, crumb, children }: PageIntroProps) {
  return (
    <header className="shell pb-[clamp(3rem,6vw,5.5rem)] pt-[calc(var(--cef-space-nav)+var(--cef-space-nav-offset)*2+clamp(2.5rem,6vw,5rem))]">
      <nav aria-label="Morzsamenü" className="text-small text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="link-draw hover:text-foreground">
              Főoldal
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">
            {crumb}
          </li>
        </ol>
      </nav>
      <h1 className="mt-8 text-display text-foreground">{typeset(title)}</h1>
      {lead || note ? (
        <div className="mt-7 flex flex-col gap-3 md:flex-row md:items-end md:gap-10">
          {lead ? <p className="max-w-[44ch] text-lead text-muted">{typeset(lead)}</p> : null}
          {note ? (
            <p aria-hidden className="-rotate-3 font-script text-script text-mocha-700">
              {typeset(note)}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </header>
  );
}
