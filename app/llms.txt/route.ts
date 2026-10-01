import { getSettings } from '@/lib/content/settings';
import { env } from '@/lib/env';
import { formatAddress } from '@/lib/format/location';

export const dynamic = 'force-dynamic';

/**
 * A plain-text summary for AI answer engines (llmstxt.org): who the café is and where the
 * authoritative pages are. Built from the same settings as the site, so it never drifts.
 */
export function GET(): Response {
  const site = getSettings('site');
  const location = getSettings('location');
  const address = formatAddress(location);
  const url = (path: string) => `${env.siteUrl}${path}`;

  const body = [
    `# ${site.brandName}`,
    '',
    `> ${site.seoDescription}`,
    '',
    address ? `Cím: ${address}` : null,
    location.phone ? `Telefon: ${location.phone}` : null,
    location.email ? `E-mail: ${location.email}` : null,
    '',
    '## Oldalak',
    '',
    `- [Főoldal](${url('/')}): bemutatkozás, kiemelt termékek, helyszín és térkép`,
    `- [Étlap és itallap](${url('/etlap')}): a teljes kínálat kategóriánként, árakkal és allergénekkel`,
    `- [Rólunk](${url('/rolunk')}): a kávézó, a csapat és a hangulat`,
    `- [Galéria](${url('/galeria')}): fotók a kávézóból`,
    '',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
