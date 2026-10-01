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
import { saveSiteAction } from './actions';

export const metadata: Metadata = { title: 'Weboldal és SEO' };

export default function SiteSettingsPage() {
  const site = getSettings('site');
  const max = env.maxUploadBytes;
  return (
    <>
      <PageHeader
        title="Weboldal és SEO"
        description="A márka neve, a keresőkben és megosztáskor látszó szöveg, valamint a logó és az ikon."
      />
      <ActionForm action={saveSiteAction}>
        <FieldGroup title="Márka">
          <TextField
            name="brandName"
            label="Név"
            defaultValue={site.brandName}
            maxLength={80}
            required
          />
          <TextField
            name="tagline"
            label="Rövid mottó"
            hint="A láblécben és az üres nyitórészen jelenik meg."
            defaultValue={site.tagline}
            maxLength={200}
          />
          <TextField
            name="homeHeading"
            label="A főoldal fő címsora (H1)"
            hint="Nem látható, de a keresők és a képernyőolvasók ezt olvassák elsőként. Pl. „Kapucinus Kávézó, Hatvan”."
            defaultValue={site.homeHeading}
            maxLength={120}
            required
          />
        </FieldGroup>

        <FieldGroup title="Keresők és megosztás">
          <TextField
            name="seoTitle"
            label="Oldalcím a keresőben"
            hint="Legfeljebb kb. 60 karakter; a főoldal címe ez lesz."
            defaultValue={site.seoTitle}
            maxLength={70}
            required
          />
          <TextAreaField
            name="seoDescription"
            label="Leírás a keresőben"
            hint="Kb. 140–160 karakter. A találat alatt ez a szöveg jelenik meg."
            defaultValue={site.seoDescription}
            rows={3}
            maxLength={170}
          />
          <ImageField
            name="ogImageId"
            label="Megosztási kép"
            hint="Facebookon, Messengerben megosztáskor ez látszik (1200×630-as kivágás a fókuszpont körül)."
            initial={getMedia(site.ogImageId)}
            maxBytes={max}
            aspect="1200/630"
          />
        </FieldGroup>

        <FieldGroup
          title="Logó és ikon"
          description="Üresen hagyva a kávézó saját logója és a „K” ikon marad."
        >
          <div className="grid gap-8 md:grid-cols-2">
            <ImageField
              name="logoId"
              label="Logó (átlátszó hátterű PNG)"
              initial={getMedia(site.logoId)}
              maxBytes={max}
              aspect="4/1"
            />
            <ImageField
              name="iconId"
              label="Böngésző ikon (négyzetes)"
              initial={getMedia(site.iconId)}
              maxBytes={max}
              aspect="1/1"
            />
          </div>
        </FieldGroup>
        <FormFooter />
      </ActionForm>
    </>
  );
}
