import type { ReactNode } from 'react';
import { typeset } from '@/lib/format/typeset';

/**
 * The shared body of the 404 and error pages: the latte art, a plain heading, one sentence, and
 * the ways back. Kept deliberately small — a status page should get out of the way.
 */
export function StatusPage({
  title,
  children,
  actions,
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly actions: ReactNode;
}) {
  return (
    <section className="shell grid min-h-[80svh] items-center gap-12 pb-section-tight pt-[calc(var(--cef-space-nav)+var(--cef-space-nav-offset)*2+3rem)] md:grid-cols-12">
      <div className="md:col-span-6">
        <h1 className="text-h1 text-foreground">{typeset(title)}</h1>
        <div className="mt-5 max-w-[42ch] text-lead text-muted">{children}</div>
        <div className="mt-9 flex flex-col gap-3 xs:flex-row">{actions}</div>
      </div>
      <picture className="mx-auto block w-full max-w-xs md:col-span-4 md:col-start-9">
        <source type="image/avif" srcSet="/brand/latte-art-520.avif" />
        <img
          src="/brand/latte-art-520.webp"
          width={520}
          height={520}
          alt=""
          className="h-auto w-full"
        />
      </picture>
    </section>
  );
}
