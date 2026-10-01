import type { Metadata } from 'next';
import { ActionForm, FieldGroup, FormFooter, TextField } from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { getSettings } from '@/lib/content/settings';
import { saveSocialAction } from './actions';

export const metadata: Metadata = { title: 'Közösségi média' };

const OTHER_ROWS = 3;

export default function SocialAdminPage() {
  const social = getSettings('social');
  return (
    <>
      <PageHeader
        title="Közösségi média"
        description="Csak a kitöltött fiókok jelennek meg. Ha egyik sincs kitöltve, a főoldal „Kövess minket” szekciója el is marad."
      />
      <ActionForm action={saveSocialAction}>
        <FieldGroup title="Fiókok" description="A teljes címet add meg, https:// kezdettel.">
          <TextField
            name="instagram"
            label="Instagram"
            type="url"
            placeholder="https://www.instagram.com/…"
            defaultValue={social.instagram}
          />
          <TextField
            name="facebook"
            label="Facebook"
            type="url"
            placeholder="https://www.facebook.com/…"
            defaultValue={social.facebook}
          />
          <TextField
            name="tiktok"
            label="TikTok"
            type="url"
            placeholder="https://www.tiktok.com/@…"
            defaultValue={social.tiktok}
          />
        </FieldGroup>
        <FieldGroup title="Egyéb linkek" description="Pl. Google értékelések, TripAdvisor.">
          {Array.from({ length: OTHER_ROWS }, (_, row) => (
            <div key={row} className="grid gap-4 sm:grid-cols-[1fr_2fr]">
              <TextField
                name={`others.${row}.label`}
                label="Megnevezés"
                defaultValue={social.others[row]?.label}
                maxLength={40}
              />
              <TextField
                name={`others.${row}.url`}
                label="Cím"
                type="url"
                defaultValue={social.others[row]?.url}
              />
            </div>
          ))}
        </FieldGroup>
        <FormFooter />
      </ActionForm>
    </>
  );
}
