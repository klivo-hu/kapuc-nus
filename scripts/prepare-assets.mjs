// @ts-check
/**
 * Prepares the project's image assets. Runs before `dev` and `build` (npm pre-scripts) and is
 * idempotent: work is skipped when its output is newer than its source.
 *
 * 1. Brand: the café's own logo (`assets/seed/logo-forras.jpg`, brown on cream) becomes a
 *    transparent wordmark in brown and in cream, and its "K" becomes the favicon and touch icon.
 *    The mark is extracted from the real logo rather than re-set in a web font.
 * 2. Artwork: the intro curtain's latte art and the coffee-into-milk section edges are rendered
 *    from their generators (`scripts/latte-art.mjs`, `scripts/coffee-edge.mjs`).
 * 3. Seed media: every photograph in `assets/seed/` is encoded into responsive AVIF/WebP variants
 *    under `.seed-media/`, with a manifest the database seeder reads on first boot.
 */
import { existsSync, statSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { encodeVariants } from '../lib/media/encode.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SEED_DIR = path.join(ROOT, 'assets/seed');
const SEED_OUT = path.join(ROOT, '.seed-media');
const BRAND_OUT = path.join(ROOT, 'public/brand');
const LOGO_SOURCE = path.join(SEED_DIR, 'logo-forras.jpg');

/** Brand colors sampled from the logo file itself. */
const LOGO_BROWN = { r: 92, g: 57, b: 45 };
const LOGO_CREAM = { r: 246, g: 233, b: 214 };
/** Wide enough for the footer mark at 2x density; palette PNG keeps it under 10 KB. */
const WORDMARK_WIDTH = 640;
const PALETTE_PNG = { palette: true, colors: 32, compressionLevel: 9, effort: 10 };

/** @param {string} output @param {string[]} sources */
function isFresh(output, sources) {
  if (!existsSync(output)) return false;
  const built = statSync(output).mtimeMs;
  return sources.every((source) => statSync(source).mtimeMs <= built);
}

/** @param {{ r: number, g: number, b: number }} rgb */
const luminance = ({ r, g, b }) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * Builds a straight-alpha RGBA buffer: ink where the logo is brown, transparent where it is cream,
 * with the anti-aliased edge preserved as partial alpha.
 * @param {Buffer} rgb raw 3-channel pixels
 * @param {{ r: number, g: number, b: number }} ink
 */
function inkWithAlpha(rgb, ink) {
  const background = luminance(LOGO_CREAM);
  const range = background - luminance(LOGO_BROWN);
  const out = Buffer.alloc((rgb.length / 3) * 4);
  for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
    const lum = 0.2126 * (rgb[i] ?? 0) + 0.7152 * (rgb[i + 1] ?? 0) + 0.0722 * (rgb[i + 2] ?? 0);
    const alpha = Math.min(1, Math.max(0, (background - lum) / range));
    out[j] = ink.r;
    out[j + 1] = ink.g;
    out[j + 2] = ink.b;
    out[j + 3] = Math.round(alpha * 255);
  }
  return out;
}

/** Finds the column span of the first glyph ("K") in a trimmed wordmark. */
function firstGlyphBox(
  /** @type {Buffer} */ rgb,
  /** @type {number} */ width,
  /** @type {number} */ height,
) {
  const isInk = (/** @type {number} */ x, /** @type {number} */ y) => {
    const i = (y * width + x) * 3;
    return (rgb[i] ?? 255) + (rgb[i + 1] ?? 255) + (rgb[i + 2] ?? 255) < 400;
  };
  let left = -1;
  let right = -1;
  for (let x = 0; x < width; x++) {
    let columnHasInk = false;
    for (let y = 0; y < height && !columnHasInk; y++) columnHasInk = isInk(x, y);
    if (columnHasInk && left === -1) left = x;
    if (!columnHasInk && left !== -1) {
      right = x - 1;
      break;
    }
  }
  let top = height;
  let bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = left; x <= right; x++) {
      if (isInk(x, y)) {
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function prepareBrand() {
  const outputs = ['logo.png', 'logo-cream.png'].map((file) => path.join(BRAND_OUT, file));
  const icon = path.join(ROOT, 'app/icon.png');
  const appleIcon = path.join(ROOT, 'app/apple-icon.png');
  if ([...outputs, icon, appleIcon].every((file) => isFresh(file, [LOGO_SOURCE]))) return;

  await mkdir(BRAND_OUT, { recursive: true });
  const trimmed = await sharp(LOGO_SOURCE).trim({ threshold: 40 }).removeAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const { width, height } = trimmed.info;
  const raw = { width, height, channels: /** @type {const} */ (4) };

  const brown = sharp(inkWithAlpha(trimmed.data, LOGO_BROWN), { raw }).resize({
    width: WORDMARK_WIDTH,
  });
  const cream = sharp(inkWithAlpha(trimmed.data, LOGO_CREAM), { raw }).resize({
    width: WORDMARK_WIDTH,
  });
  await brown.png(PALETTE_PNG).toFile(path.join(BRAND_OUT, 'logo.png'));
  await cream.png(PALETTE_PNG).toFile(path.join(BRAND_OUT, 'logo-cream.png'));

  // The favicon is the logo's own "K", centered on the logo's cream.
  const box = firstGlyphBox(trimmed.data, width, height);
  const glyph = await sharp(inkWithAlpha(trimmed.data, LOGO_BROWN), { raw })
    .extract(box)
    .png()
    .toBuffer();
  const makeIcon = async (/** @type {number} */ size, /** @type {string} */ file) => {
    const inner = await sharp(glyph)
      .resize({ height: Math.round(size * 0.56) })
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: { ...LOGO_CREAM, alpha: 1 } },
    })
      .composite([{ input: inner, gravity: 'center' }])
      .png(PALETTE_PNG)
      .toFile(file);
  };
  await makeIcon(512, icon);
  await makeIcon(180, appleIcon);
  console.log('[assets] brand wordmark and icons written');
}

async function prepareSeedMedia() {
  const manifestPath = path.join(SEED_OUT, 'manifest.json');
  const files = (await readdir(SEED_DIR))
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file) && file !== path.basename(LOGO_SOURCE))
    .sort();
  const sources = files.map((file) => path.join(SEED_DIR, file));
  if (isFresh(manifestPath, sources)) {
    const current = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (Object.keys(current).length === files.length) return;
  }

  /** @type {Record<string, unknown>} */
  const manifest = {};
  for (const file of files) {
    const key = path.parse(file).name;
    manifest[key] = await encodeVariants(path.join(SEED_DIR, file), path.join(SEED_OUT, key));
    console.log(`[assets] seed image encoded: ${key}`);
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

/** The intro curtain's latte art, rasterized with transparency at the two sizes the curtain uses. */
async function prepareLatteArt() {
  const generator = path.join(ROOT, 'scripts/latte-art.mjs');
  const sizes = [520, 1040];
  const outputs = sizes.flatMap((size) =>
    ['avif', 'webp'].map((ext) => path.join(BRAND_OUT, `latte-art-${size}.${ext}`)),
  );
  if (outputs.every((file) => isFresh(file, [generator]))) return;

  const { latteArtSvg } = await import('./latte-art.mjs');
  const master = await sharp(Buffer.from(latteArtSvg({ size: 1600 })))
    .png()
    .toBuffer();
  for (const size of sizes) {
    const resized = sharp(master).resize({ width: size });
    await resized
      .clone()
      .avif({ quality: 60, effort: 6 })
      .toFile(path.join(BRAND_OUT, `latte-art-${size}.avif`));
    await resized
      .clone()
      .webp({ quality: 82, alphaQuality: 90 })
      .toFile(path.join(BRAND_OUT, `latte-art-${size}.webp`));
  }
  console.log('[assets] latte art rendered');
}

/**
 * The section edges: two different pours (`a`, `b`), each at the two widths the browser picks
 * from. The solid brown runs along the top; components flip an edge to crown a section.
 */
async function prepareCoffeeEdges() {
  const generator = path.join(ROOT, 'scripts/coffee-edge.mjs');
  const pours = [
    { name: 'a', seed: 11 },
    { name: 'b', seed: 5 },
  ];
  const widths = [1440, 2880];
  const outputs = pours.flatMap(({ name }) =>
    widths.flatMap((width) =>
      ['avif', 'webp'].map((ext) => path.join(BRAND_OUT, `coffee-edge-${name}-${width}.${ext}`)),
    ),
  );
  // This script is a source too: it holds the seeds.
  const sources = [generator, fileURLToPath(import.meta.url)];
  if (outputs.every((file) => isFresh(file, sources))) return;

  await mkdir(BRAND_OUT, { recursive: true });
  const { renderCoffeeEdge } = await import('./coffee-edge.mjs');
  for (const pour of pours) {
    const { data, width, height } = renderCoffeeEdge({ width: 2880, height: 640, seed: pour.seed });
    for (const size of widths) {
      const resized = sharp(data, { raw: { width, height, channels: 4 } }).resize({ width: size });
      // Full-resolution chroma, so the solid edge meets the section's flat colour without a seam.
      await resized
        .clone()
        .avif({ quality: 64, effort: 6, chromaSubsampling: '4:4:4' })
        .toFile(path.join(BRAND_OUT, `coffee-edge-${pour.name}-${size}.avif`));
      await resized
        .clone()
        .webp({ quality: 84, alphaQuality: 90, effort: 6 })
        .toFile(path.join(BRAND_OUT, `coffee-edge-${pour.name}-${size}.webp`));
    }
  }
  console.log('[assets] coffee edges rendered');
}

await prepareBrand();
await prepareLatteArt();
await prepareCoffeeEdges();
await prepareSeedMedia();
