import {
  ActionForm,
  CheckboxField,
  FieldGroup,
  FormFooter,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/admin/form';
import { ImageField } from '@/components/admin/image-field';
import { DIETARY_LABELS } from '@/lib/content/dietary';
import { DIETARY_TAGS, type MenuCategory, type Product } from '@/lib/content/types';
import { env } from '@/lib/env';
import { saveProductAction } from './actions';

export function ProductForm({
  product,
  categories,
  defaultCategoryId,
}: {
  readonly product: Product | null;
  readonly categories: readonly MenuCategory[];
  readonly defaultCategoryId?: number;
}) {
  return (
    <ActionForm action={saveProductAction.bind(null, product?.id ?? null)}>
      <FieldGroup title="Alapadatok">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="name"
            label="Név"
            defaultValue={product?.name}
            maxLength={120}
            required
          />
          <SelectField
            name="categoryId"
            label="Kategória"
            defaultValue={product?.categoryId ?? defaultCategoryId ?? categories[0]?.id}
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
          />
        </div>
        <TextAreaField
          name="description"
          label="Leírás"
          hint="Egy rövid mondat: mi van benne, miben különleges."
          defaultValue={product?.description}
          rows={3}
          maxLength={500}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="price"
            label="Ár (Ft)"
            hint="Egész forintban, pl. 1290. Üresen hagyva nem jelenik meg ár."
            defaultValue={product?.price ?? ''}
            inputMode="numeric"
          />
          <TextField
            name="priceNote"
            label="Egység (nem kötelező)"
            hint="Az ár után jelenik meg, pl. „szelet” vagy „3 dl”."
            defaultValue={product?.priceNote}
            maxLength={24}
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Kép"
        description="Nem kötelező. A kiemelt termékeknél a főoldalon is megjelenik."
      >
        <ImageField
          name="mediaId"
          label="Termékfotó"
          initial={product?.image ?? null}
          maxBytes={env.maxUploadBytes}
        />
      </FieldGroup>

      <FieldGroup title="Összetevők és jelölések">
        <TextField
          name="allergens"
          label="Allergének"
          hint="Vesszővel elválasztva, pl. glutén, tej, tojás, diófélék."
          defaultValue={product?.allergens}
          maxLength={200}
        />
        <fieldset>
          <legend className="text-small font-medium text-foreground">Étrendi jelölések</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {DIETARY_TAGS.map((tag) => (
              <CheckboxField
                key={tag}
                name="dietary"
                value={tag}
                label={DIETARY_LABELS[tag]}
                defaultChecked={product?.dietary.includes(tag)}
              />
            ))}
          </div>
        </fieldset>
      </FieldGroup>

      <FieldGroup title="Megjelenés">
        <CheckboxField
          name="isAvailable"
          label="Kapható"
          hint="Ha nem kapható, az étlapon halványan, „Jelenleg nem kapható” jelöléssel látszik."
          defaultChecked={product?.isAvailable ?? true}
        />
        <CheckboxField
          name="isFeatured"
          label="Kiemelt termék"
          hint="A főoldal kiemelt termékei között jelenik meg (ha kapható)."
          defaultChecked={product?.isFeatured ?? false}
        />
      </FieldGroup>
      <FormFooter submitLabel={product ? 'Mentés' : 'Termék létrehozása'} />
    </ActionForm>
  );
}
