import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  readonly title: string;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8">
      {back ? (
        <Link
          href={back.href}
          className="mb-4 inline-flex items-center gap-1 text-small text-muted hover:text-foreground"
        >
          <ChevronLeft aria-hidden className="size-4" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-h2 text-foreground">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-small text-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

/** A banner for a notice that needs the administrator's attention. */
export function Notice({
  tone = 'info',
  children,
}: {
  readonly tone?: 'info' | 'warning';
  readonly children: ReactNode;
}) {
  return (
    <div
      role="note"
      className={
        tone === 'warning'
          ? 'mb-6 rounded-md bg-[rgb(var(--cef-warning-rgb)/0.1)] px-4 py-3 text-small text-[rgb(var(--cef-warning-rgb))]'
          : 'mb-6 rounded-md bg-sage-100 px-4 py-3 text-small text-forest-800'
      }
    >
      {children}
    </div>
  );
}
