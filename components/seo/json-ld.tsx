import { serializeJsonLd } from '@/lib/seo/jsonld';

/** One structured-data block. Values are serialized with `<` escaped (see serializeJsonLd). */
export function JsonLd({
  data,
}: {
  readonly data: Record<string, unknown> | readonly Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
