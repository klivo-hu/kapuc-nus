import {
  ActionForm,
  CheckboxField,
  FieldGroup,
  FormFooter,
  TextAreaField,
  TextField,
} from '@/components/admin/form';
import { ImageField } from '@/components/admin/image-field';
import type { HeroSlide } from '@/lib/content/types';
import { env } from '@/lib/env';
import { saveSlideAction } from './actions';

/** Create and edit share one form; `slide` is null when creating. */
export function SlideForm({ slide }: { readonly slide: HeroSlide | null }) {
  return (
    <ActionForm action={saveSlideAction.bind(null, slide?.id ?? null)}>
      <FieldGroup
        title="Kép"
        description="Álló (4:5) fotó mutat a legjobban. Mobilon a fókuszpont körül vágódik."
      >
        <ImageField
          name="mediaId"
          label="Slide képe"
          initial={slide?.image ?? null}
          maxBytes={env.maxUploadBytes}
        />
        <TextField
          name="imageAlt"
          label="A kép leírása (alt szöveg)"
          hint="Mit látni a képen? Képernyőolvasók és keresők olvassák fel."
          defaultValue={slide?.imageAlt}
          maxLength={200}
        />
      </FieldGroup>
      <FieldGroup title="Szöveg">
        <TextField name="title" label="Cím" defaultValue={slide?.title} maxLength={120} required />
        <TextAreaField
          name="description"
          label="Leírás"
          hint="Egy-két rövid mondat."
          defaultValue={slide?.description}
          rows={3}
          maxLength={400}
        />
        <TextField
          name="note"
          label="Kézírásos megjegyzés (nem kötelező)"
          hint="Két-három szó, kézírásos betűvel jelenik meg, pl. „frissen őrölve”."
          defaultValue={slide?.note}
          maxLength={40}
        />
        <CheckboxField
          name="isActive"
          label="Megjelenik a főoldalon"
          defaultChecked={slide?.isActive ?? true}
        />
      </FieldGroup>
      <FormFooter submitLabel={slide ? 'Mentés' : 'Slide létrehozása'} />
    </ActionForm>
  );
}
