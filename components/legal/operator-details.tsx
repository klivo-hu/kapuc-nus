import type { OperatorSettings } from '@/lib/content/settings-schema';

type Field = { label: string; value: string; href?: string };

/**
 * The operator's legal details, from the admin. Only entered fields are listed; if none are, the
 * page says so plainly rather than printing blanks or invented values.
 */
export function OperatorDetails({
  operator,
  includeHosting = false,
}: {
  readonly operator: OperatorSettings;
  readonly includeHosting?: boolean;
}) {
  const fields: Field[] = [
    { label: 'Üzemeltető', value: operator.companyName },
    { label: 'Székhely', value: operator.seat },
    { label: 'Cégjegyzékszám / nyilvántartási szám', value: operator.registrationNumber },
    { label: 'Adószám', value: operator.taxNumber },
    {
      label: 'E-mail',
      value: operator.email,
      href: operator.email ? `mailto:${operator.email}` : undefined,
    },
    {
      label: 'Telefon',
      value: operator.phone,
      href: operator.phone ? `tel:${operator.phone.replace(/\s+/g, '')}` : undefined,
    },
  ].filter((field) => field.value !== '');

  const hosting: Field[] = includeHosting
    ? [
        { label: 'Tárhelyszolgáltató', value: operator.hostingProvider },
        { label: 'Címe', value: operator.hostingAddress },
        { label: 'Elérhetősége', value: operator.hostingContact },
      ].filter((field) => field.value !== '')
    : [];

  if (fields.length === 0 && hosting.length === 0) {
    return <p>Az üzemeltető adatainak feltöltése folyamatban van.</p>;
  }

  const list = (items: Field[]) => (
    <dl className="divide-y divide-border border-y border-border">
      {items.map((field) => (
        <div key={field.label} className="grid gap-1 py-3 sm:grid-cols-[16rem_1fr] sm:gap-6">
          <dt className="text-small text-muted">{field.label}</dt>
          <dd className="text-foreground">
            {field.href ? (
              <a href={field.href} className="underline">
                {field.value}
              </a>
            ) : (
              field.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );

  return (
    <>
      {fields.length > 0 ? list(fields) : null}
      {hosting.length > 0 ? (
        <>
          <h2>Tárhelyszolgáltató</h2>
          {list(hosting)}
        </>
      ) : null}
    </>
  );
}
