/** Content types shared by the public site and the admin. Plain data, no behavior. */

export interface ImageAsset {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  /** Mean color, painted behind the image while it loads. */
  readonly color: string;
  /** Encoded widths, ascending; each exists as .avif and .webp. */
  readonly widths: readonly number[];
  /** Focal point in percent, used as object-position when the image is cropped. */
  readonly focalX: number;
  readonly focalY: number;
}

export interface HeroSlide {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly note: string;
  readonly image: ImageAsset | null;
  readonly imageAlt: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
}

export interface MenuCategory {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
}

export const DIETARY_TAGS = [
  'vegan',
  'vegetarian',
  'gluten-free',
  'lactose-free',
  'sugar-free',
] as const;
export type DietaryTag = (typeof DIETARY_TAGS)[number];

export interface Product {
  readonly id: number;
  readonly categoryId: number;
  readonly name: string;
  readonly description: string;
  /** Whole forints. Null until the café sets it; the menu then shows no price. */
  readonly price: number | null;
  /** Unit or size shown after the price, e.g. "szelet" or "3 dl". */
  readonly priceNote: string;
  readonly image: ImageAsset | null;
  readonly allergens: string;
  readonly dietary: readonly DietaryTag[];
  readonly isFeatured: boolean;
  readonly featuredOrder: number;
  readonly isAvailable: boolean;
  readonly sortOrder: number;
}

export interface MenuSection extends MenuCategory {
  readonly products: readonly Product[];
}

export interface GalleryCategory {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly sortOrder: number;
}

export interface GalleryItem {
  readonly id: number;
  readonly image: ImageAsset;
  readonly title: string;
  readonly alt: string;
  readonly description: string;
  readonly categoryId: number | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
}
