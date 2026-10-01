// @ts-check
/**
 * The one image-encoding pipeline, shared by the build-time seed script (`scripts/prepare-assets.mjs`)
 * and runtime admin uploads (`lib/media/store.ts`). Plain ESM so both a bare `node` script and the
 * Next.js server can import it; types live in `encode.d.mts`.
 *
 * Every image is re-encoded, never stored as uploaded: EXIF orientation is applied, metadata is
 * stripped, and each width is written once as AVIF and once as WebP. The browser picks the format
 * through <picture>, so no request ever pays for an optimizer at runtime.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/** Responsive widths. A variant is never upscaled past the source width. */
export const VARIANT_WIDTHS = [480, 800, 1200, 1600, 2000];

/** Guard against decompression bombs: refuse anything above ~60 megapixels before decoding. */
export const MAX_INPUT_PIXELS = 60_000_000;

const AVIF_OPTIONS = { quality: 52, effort: 4 };
const WEBP_OPTIONS = { quality: 78, effort: 5 };

/**
 * Picks the widths to generate for a source: every standard step below the source width, plus the
 * source width itself so the largest variant is full resolution.
 * @param {number} sourceWidth
 * @returns {number[]}
 */
export function variantWidthsFor(sourceWidth) {
  const steps = VARIANT_WIDTHS.filter((width) => width < sourceWidth);
  const top = Math.min(sourceWidth, VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1] ?? sourceWidth);
  return [...new Set([...steps, top])].sort((a, b) => a - b);
}

/**
 * The mean color of the image — a calmer stand-in while it loads than the most frequent color,
 * which for a photo on a dark counter is simply black.
 * @param {import('sharp').Stats} stats
 * @returns {string}
 */
function meanColor(stats) {
  const [r, g, b] = stats.channels.map((channel) => Math.round(channel.mean));
  return `#${[r ?? 0, g ?? 0, b ?? 0].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Encodes one source image into `outDir/<width>.avif` and `outDir/<width>.webp`.
 * @param {Buffer | string} input
 * @param {string} outDir
 * @returns {Promise<{ width: number, height: number, color: string, widths: number[], bytes: number }>}
 */
export async function encodeVariants(input, outDir) {
  const base = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' }).rotate();
  const { data: normalized, info } = await base.toBuffer({ resolveWithObject: true });
  const stats = await sharp(normalized).stats();
  const widths = variantWidthsFor(info.width);

  await mkdir(outDir, { recursive: true });
  let bytes = 0;
  for (const width of widths) {
    const resized = sharp(normalized).resize({ width, withoutEnlargement: true });
    const [avif, webp] = await Promise.all([
      resized.clone().avif(AVIF_OPTIONS).toBuffer(),
      resized.clone().webp(WEBP_OPTIONS).toBuffer(),
    ]);
    await Promise.all([
      writeFile(path.join(outDir, `${width}.avif`), avif),
      writeFile(path.join(outDir, `${width}.webp`), webp),
    ]);
    bytes += avif.length + webp.length;
  }

  return {
    width: info.width,
    height: info.height,
    color: meanColor(stats),
    widths,
    bytes,
  };
}
