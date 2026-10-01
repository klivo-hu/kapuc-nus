import { ButtonLink } from '@/components/ui/button';

/**
 * The two actions a visitor on a phone most often came for — the menu and the way here — kept
 * within thumb reach at the bottom of every page. Hidden from the large layout, where both live
 * in the navigation bar. Its height is published as --cef-space-dock so the consent window and
 * the footer make room for it.
 */
export function MobileDock({ directionsUrl }: { readonly directionsUrl: string }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 lg:hidden">
      <nav
        aria-label="Gyors elérés"
        className="mx-auto grid max-w-md grid-cols-2 gap-2 rounded-nav bg-cream-50 p-2 shadow-md"
      >
        <ButtonLink href="/etlap" variant="secondary" size="md" className="h-11">
          Étlap és itallap
        </ButtonLink>
        <ButtonLink href={directionsUrl} external size="md" className="h-11">
          Útvonaltervezés
        </ButtonLink>
      </nav>
    </div>
  );
}
