export declare const VARIANT_WIDTHS: readonly number[];
export declare const MAX_INPUT_PIXELS: number;

export interface EncodedImage {
  readonly width: number;
  readonly height: number;
  /** Dominant color as #rrggbb — painted behind the image while it loads. */
  readonly color: string;
  readonly widths: number[];
  readonly bytes: number;
}

export declare function variantWidthsFor(sourceWidth: number): number[];
export declare function encodeVariants(
  input: Buffer | string,
  outDir: string,
): Promise<EncodedImage>;
