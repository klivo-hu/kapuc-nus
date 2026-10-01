import type { Metadata } from 'next';
import {
  ActionForm,
  CheckboxField,
  FieldGroup,
  FormFooter,
  TextAreaField,
  TextField,
} from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { getSettings } from '@/lib/content/settings';
import { DAY_NAMES } from '@/lib/format/location';
import { saveLocationAction } from './actions';

export const metadata: Metadata = { title: 'Helyszín és nyitvatartás' };

export default function LocationAdminPage() {
  const location = getSettings('location');

  return (
    <>
      <PageHeader
        title="Helyszín és nyitvatartás"
        description="A főoldal „Itt találsz meg” része, a lábléc és a keresőknek szóló adatok ebből dolgoznak. Amit üresen hagysz, az nem jelenik meg."
      />
      <ActionForm action={saveLocationAction}>
        <FieldGroup title="Cím és elérhetőség">
          <TextField name="name" label="Hely neve" defaultValue={location.name} maxLength={120} />
          <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
            <TextField
              name="postalCode"
              label="Irányítószám"
              defaultValue={location.postalCode}
              maxLength={12}
              inputMode="numeric"
            />
            <TextField name="city" label="Település" defaultValue={location.city} maxLength={80} />
          </div>
          <TextField
            name="street"
            label="Utca, házszám"
            hint="Pl. „Kossuth tér 1.” Amíg üres, a weboldalon csak a település látszik."
            defaultValue={location.street}
            maxLength={160}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="phone"
              label="Telefonszám"
              type="tel"
              defaultValue={location.phone}
              maxLength={40}
            />
            <TextField
              name="email"
              label="E-mail cím"
              type="email"
              defaultValue={location.email}
              maxLength={160}
            />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Nyitvatartás"
          description="Minden napot tölts ki (vagy jelöld zárva), különben a nyitvatartás nem jelenik meg a weboldalon."
        >
          <div className="divide-y divide-border">
            {DAY_NAMES.map((day, index) => {
              const hours = location.hours[index];
              return (
                <div
                  key={day}
                  className="grid items-end gap-4 py-4 sm:grid-cols-[7rem_1fr_1fr_auto]"
                >
                  <p className="text-small font-medium text-foreground sm:pb-3">{day}</p>
                  <TextField
                    name={`hours.${index}.open`}
                    label="Nyitás"
                    type="time"
                    defaultValue={hours?.open}
                  />
                  <TextField
                    name={`hours.${index}.close`}
                    label="Zárás"
                    type="time"
                    defaultValue={hours?.close}
                  />
                  <div className="sm:pb-3">
                    <CheckboxField
                      name={`hours.${index}.closed`}
                      label="Zárva"
                      defaultChecked={hours?.closed}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <TextField
            name="hoursNote"
            label="Megjegyzés (nem kötelező)"
            hint="Pl. ünnepnapi nyitvatartás."
            defaultValue={location.hoursNote}
            maxLength={200}
          />
        </FieldGroup>

        <FieldGroup title="Térkép és útvonal">
          <TextAreaField
            name="mapEmbedUrl"
            label="Google Térkép beágyazás"
            hint="Google Térkép → Megosztás → Térkép beágyazása: másold ide a teljes <iframe …> kódot vagy csak a címét."
            defaultValue={location.mapEmbedUrl}
            rows={3}
            monospace
          />
          <TextField
            name="directionsUrl"
            label="Útvonaltervezés linkje"
            hint="Erre visz az „Útvonaltervezés” gomb. Üresen hagyva a név és a cím alapján készül."
            defaultValue={location.directionsUrl}
            type="url"
          />
          <TextField
            name="mapsUrl"
            label="A hely Google Térkép oldala"
            hint="A „Megnyitás a Térképen” gomb célja."
            defaultValue={location.mapsUrl}
            type="url"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="latitude"
              label="Szélesség (nem kötelező)"
              hint="Pl. 47.6674. A keresőknek szóló adatokhoz."
              defaultValue={location.latitude ?? ''}
              inputMode="decimal"
            />
            <TextField
              name="longitude"
              label="Hosszúság (nem kötelező)"
              hint="Pl. 19.6830."
              defaultValue={location.longitude ?? ''}
              inputMode="decimal"
            />
          </div>
        </FieldGroup>
        <FormFooter />
      </ActionForm>
    </>
  );
}
