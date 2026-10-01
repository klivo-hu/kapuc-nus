import { ArrowUpRight } from 'lucide-react';
import { SocialIcon } from '@/components/site/social-icon';
import type { SocialLink } from '@/lib/site/social';
import { typeset } from '@/lib/format/typeset';

/**
 * "Kövess minket": rendered only when the café has entered at least one account. The accounts
 * are set large, as a typographic list on the cream that the coffee band above pours into,
 * rather than as a row of badges.
 */
export function SocialSection({ links }: { readonly links: readonly SocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <section aria-labelledby="kovess-cim" className="shell py-section">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <h2 id="kovess-cim" className="text-h1 text-foreground">
            Kövess minket
          </h2>
          <p className="mt-5 max-w-[40ch] text-lead text-muted">
            {typeset(
              'Új sütemények, szezonális italok és esti hangulat. Nálunk előbb látod, mint bárhol máshol.',
            )}
          </p>
        </div>
        <ul className="border-t border-mocha-700/20 lg:col-span-6 lg:col-start-7">
          {links.map((link) => (
            <li key={link.url} className="border-b border-mocha-700/20">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 py-6 font-serif text-h3 text-foreground transition-colors hover:text-mocha-700"
              >
                <span className="flex items-center gap-4">
                  <SocialIcon network={link.network} className="size-6 shrink-0 text-mocha-700" />
                  {link.label}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="size-6 text-mocha-700 transition-transform duration-normal ease-out group-hover:-translate-y-1 group-hover:translate-x-1"
                />
                <span className="sr-only"> (új lapon nyílik meg)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
