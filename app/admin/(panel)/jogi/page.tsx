import type { Metadata } from 'next';
import {
  ActionForm,
  FieldGroup,
  FormFooter,
  TextAreaField,
  TextField,
} from '@/components/admin/form';
import { Notice, PageHeader } from '@/components/admin/page-header';
import { getSettings } from '@/lib/content/settings';
import { saveLegalAction, saveOperatorAction } from './actions';

export const metadata: Metadata = { title: 'Jogi adatok' };

const MARKDOWN_HINT =
  'Formázás: „## Cím”, „### Alcím”, „- felsorolás”, **félkövér**, [link szövege](https://…). Bekezdés: üres sor.';

export default function LegalAdminPage() {
  const operator = getSettings('operator');
  const legal = getSettings('legal');
  return (
    <>
      <PageHeader
        title="Jogi adatok"
        description="Az Impresszum, az Adatkezelési tájékoztató és a Cookie tájékoztató tartalma."
      />
      <Notice tone="warning">
        A tájékoztatók szövege tervezet, amely az oldal tényleges működését írja le. Élesítés előtt
        nézesse át jogi szakemberrel, és töltse ki az üzemeltető adatait.
      </Notice>

      <ActionForm action={saveOperatorAction}>
        <FieldGroup
          title="Üzemeltető"
          description="Az Impresszumon és az Adatkezelési tájékoztatóban jelenik meg."
        >
          <TextField
            name="companyName"
            label="Cégnév / egyéni vállalkozó neve"
            defaultValue={operator.companyName}
            maxLength={160}
          />
          <TextField name="seat" label="Székhely" defaultValue={operator.seat} maxLength={200} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="registrationNumber"
              label="Cégjegyzék- vagy nyilvántartási szám"
              defaultValue={operator.registrationNumber}
              maxLength={60}
            />
            <TextField
              name="taxNumber"
              label="Adószám"
              defaultValue={operator.taxNumber}
              maxLength={40}
            />
            <TextField
              name="email"
              label="E-mail"
              type="email"
              defaultValue={operator.email}
              maxLength={160}
            />
            <TextField
              name="phone"
              label="Telefon"
              type="tel"
              defaultValue={operator.phone}
              maxLength={40}
            />
          </div>
        </FieldGroup>
        <FieldGroup title="Tárhelyszolgáltató">
          <TextField
            name="hostingProvider"
            label="Név"
            defaultValue={operator.hostingProvider}
            maxLength={160}
          />
          <TextField
            name="hostingAddress"
            label="Cím"
            defaultValue={operator.hostingAddress}
            maxLength={200}
          />
          <TextField
            name="hostingContact"
            label="Elérhetőség"
            defaultValue={operator.hostingContact}
            maxLength={160}
          />
        </FieldGroup>
        <FormFooter />
      </ActionForm>

      <ActionForm action={saveLegalAction} className="mt-12 space-y-8">
        <FieldGroup title="Tájékoztatók szövege">
          <TextField
            name="effectiveDate"
            label="Hatályos"
            type="date"
            hint="Mindhárom oldal tetején megjelenik."
            defaultValue={legal.effectiveDate}
          />
          <TextAreaField
            name="privacy"
            label="Adatkezelési tájékoztató"
            hint={MARKDOWN_HINT}
            defaultValue={legal.privacy}
            rows={18}
            monospace
          />
          <TextAreaField
            name="cookies"
            label="Cookie tájékoztató"
            hint={MARKDOWN_HINT}
            defaultValue={legal.cookies}
            rows={14}
            monospace
          />
          <TextAreaField
            name="impressumNote"
            label="Impresszum – kiegészítés (nem kötelező)"
            hint={MARKDOWN_HINT}
            defaultValue={legal.impressumNote}
            rows={6}
            monospace
          />
        </FieldGroup>
        <FormFooter />
      </ActionForm>
    </>
  );
}
