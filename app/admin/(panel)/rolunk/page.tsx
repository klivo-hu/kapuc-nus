import type { Metadata } from 'next';
import {
  ActionForm,
  FieldGroup,
  FormFooter,
  TextAreaField,
  TextField,
} from '@/components/admin/form';
import { ImageField } from '@/components/admin/image-field';
import { PageHeader } from '@/components/admin/page-header';
import { getMedia } from '@/lib/content/media';
import { getSettings } from '@/lib/content/settings';
import { env } from '@/lib/env';
import { saveAboutPageAction, saveHomeAboutAction } from './actions';
import { ATMOSPHERE_SLOTS, VALUE_ROWS } from './constants';

export const metadata: Metadata = { title: 'Rólunk' };

export default function AboutAdminPage() {
  const about = getSettings('about');
  const page = getSettings('aboutPage');
  const max = env.maxUploadBytes;

  return (
    <>
      <PageHeader
        title="Rólunk"
        description="A főoldal bemutatkozó szekciója és a külön Rólunk oldal. Üres mezők nem jelennek meg a weboldalon."
      />

      <h2 className="mb-4 font-serif text-h3 text-foreground">Főoldali szekció</h2>
      <ActionForm action={saveHomeAboutAction}>
        <FieldGroup title="Szöveg">
          <TextField
            name="heading"
            label="Cím"
            defaultValue={about.heading}
            maxLength={120}
            required
          />
          <TextAreaField
            name="lead"
            label="Bevezető"
            defaultValue={about.lead}
            rows={3}
            maxLength={400}
          />
          <TextAreaField
            name="body"
            label="Szöveg"
            defaultValue={about.body}
            rows={5}
            maxLength={1500}
          />
          <TextField
            name="note"
            label="Kézírásos megjegyzés"
            hint="Pár szó a kép alatt, kézírásos betűvel."
            defaultValue={about.note}
            maxLength={40}
          />
        </FieldGroup>
        <FieldGroup
          title="Képek"
          description="A nagy kép lehetőleg csapatfotó vagy felszolgálás közben készült kép legyen."
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <ImageField
                name="primaryImageId"
                label="Nagy kép"
                initial={getMedia(about.primaryImageId)}
                maxBytes={max}
              />
              <TextField
                name="primaryImageAlt"
                label="Nagy kép leírása (alt)"
                defaultValue={about.primaryImageAlt}
                maxLength={200}
              />
            </div>
            <div className="space-y-4">
              <ImageField
                name="secondaryImageId"
                label="Kis kép"
                initial={getMedia(about.secondaryImageId)}
                maxBytes={max}
              />
              <TextField
                name="secondaryImageAlt"
                label="Kis kép leírása (alt)"
                defaultValue={about.secondaryImageAlt}
                maxLength={200}
              />
            </div>
          </div>
        </FieldGroup>
        <FormFooter />
      </ActionForm>

      <h2 className="mb-4 mt-14 font-serif text-h3 text-foreground">Rólunk oldal</h2>
      <ActionForm action={saveAboutPageAction}>
        <FieldGroup title="Nyitás">
          <TextField
            name="heading"
            label="Oldalcím"
            defaultValue={page.heading}
            maxLength={120}
            required
          />
          <TextAreaField
            name="lead"
            label="Bevezető"
            defaultValue={page.lead}
            rows={2}
            maxLength={400}
          />
          <ImageField
            name="heroImage.id"
            label="Nyitókép"
            initial={getMedia(page.heroImage.id)}
            maxBytes={max}
            aspect="16/9"
          />
          <TextField
            name="heroImage.alt"
            label="Nyitókép leírása (alt)"
            defaultValue={page.heroImage.alt}
            maxLength={200}
          />
        </FieldGroup>

        <FieldGroup title="Történet" description="Bekezdéseket üres sorral választhatsz el.">
          <TextField
            name="storyHeading"
            label="Cím"
            defaultValue={page.storyHeading}
            maxLength={120}
          />
          <TextAreaField
            name="storyBody"
            label="Szöveg"
            defaultValue={page.storyBody}
            rows={8}
            maxLength={4000}
          />
        </FieldGroup>

        <FieldGroup
          title="Értékek"
          description={`Legfeljebb ${VALUE_ROWS}. Az üresen hagyott sorok nem jelennek meg.`}
        >
          <TextField
            name="valuesHeading"
            label="Szekció címe"
            defaultValue={page.valuesHeading}
            maxLength={120}
          />
          {Array.from({ length: VALUE_ROWS }, (_, row) => (
            <div
              key={row}
              className="grid gap-4 border-t border-border pt-5 md:grid-cols-[1fr_2fr]"
            >
              <TextField
                name={`values.${row}.title`}
                label={`${row + 1}. érték címe`}
                defaultValue={page.values[row]?.title}
                maxLength={80}
              />
              <TextAreaField
                name={`values.${row}.text`}
                label="Szöveg"
                defaultValue={page.values[row]?.text}
                rows={2}
                maxLength={400}
              />
            </div>
          ))}
        </FieldGroup>

        <FieldGroup title="Hangulat">
          <TextField
            name="atmosphereHeading"
            label="Cím"
            defaultValue={page.atmosphereHeading}
            maxLength={120}
          />
          <TextAreaField
            name="atmosphereBody"
            label="Szöveg"
            defaultValue={page.atmosphereBody}
            rows={3}
            maxLength={1500}
          />
          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: ATMOSPHERE_SLOTS }, (_, slot) => {
              const entry = page.atmosphereImages[slot];
              return (
                <div key={slot} className="space-y-4">
                  <ImageField
                    name={`atmosphere.${slot}.id`}
                    label={slot === 0 ? 'Nagy kép' : `${slot + 1}. kép`}
                    initial={getMedia(entry?.id)}
                    maxBytes={max}
                  />
                  <TextField
                    name={`atmosphere.${slot}.alt`}
                    label="Leírás (alt)"
                    defaultValue={entry?.alt}
                    maxLength={200}
                  />
                </div>
              );
            })}
          </div>
        </FieldGroup>

        <FieldGroup title="Csapat">
          <TextField
            name="teamHeading"
            label="Cím"
            defaultValue={page.teamHeading}
            maxLength={120}
          />
          <TextAreaField
            name="teamBody"
            label="Szöveg"
            defaultValue={page.teamBody}
            rows={4}
            maxLength={1500}
          />
          <ImageField
            name="teamImage.id"
            label="Csapatkép"
            hint="Ide érdemes valódi csapatfotót feltölteni."
            initial={getMedia(page.teamImage.id)}
            maxBytes={max}
          />
          <TextField
            name="teamImage.alt"
            label="Csapatkép leírása (alt)"
            defaultValue={page.teamImage.alt}
            maxLength={200}
          />
          <TextField
            name="closingNote"
            label="Kézírásos zárómondat"
            hint="Az oldal alján, a „Gyere el hozzánk” mellett."
            defaultValue={page.closingNote}
            maxLength={40}
          />
        </FieldGroup>
        <FormFooter />
      </ActionForm>
    </>
  );
}
