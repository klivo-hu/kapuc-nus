import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { typeset } from '@/lib/format/typeset';

/** The closing invitation on inner pages: the two things a reader most likely wants next. */
export function VisitBand({
  directionsUrl,
  note,
}: {
  readonly directionsUrl: string;
  readonly note?: string;
}) {
  return (
    <section aria-labelledby="latogass-cim" className="shell pb-section-tight pt-section-tight">
      <div className="flex flex-col gap-8 border-t border-border pt-12 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="latogass-cim" className="text-h1 text-foreground">
            Gyere el hozzánk
          </h2>
          {note ? (
            <p aria-hidden className="mt-2 -rotate-2 font-script text-script text-mocha-700">
              {typeset(note)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 xs:flex-row">
          <ButtonLink
            href={directionsUrl}
            external
            size="lg"
            icon={<ArrowUpRight className="size-4" />}
          >
            Útvonaltervezés
          </ButtonLink>
          <ButtonLink
            href="/etlap"
            variant="secondary"
            size="lg"
            icon={<ArrowRight className="size-4" />}
          >
            Étlap és itallap
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
