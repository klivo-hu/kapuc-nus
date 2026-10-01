import 'server-only';
import { cpSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import { mediaDir, seedMediaRoot } from '@/lib/media/paths';
import { SEED_GALLERY, SEED_GALLERY_CATEGORIES, SEED_MENU, SEED_SLIDES } from './seed-data';

const SEEDED_MARKER = '_seeded';

interface ManifestEntry {
  width: number;
  height: number;
  color: string;
  widths: number[];
  bytes: number;
}

/**
 * Loads the café's photographs and starting content into an empty database, once. The marker row
 * means an administrator who later deletes everything gets an empty site, not the seed again.
 */
export function seedIfEmpty(db: Database.Database): void {
  const marker = db.prepare('SELECT 1 FROM settings WHERE key = ?').get(SEEDED_MARKER);
  if (marker) return;

  const media = loadSeedMedia(db);
  const imageId = (key: string | undefined) => (key && media.has(key) ? `seed-${key}` : null);

  db.transaction(() => {
    const insertSlide = db.prepare(
      `INSERT INTO hero_slides (media_id, image_alt, title, description, note, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    SEED_SLIDES.forEach((slide, index) =>
      insertSlide.run(
        imageId(slide.image),
        slide.imageAlt,
        slide.title,
        slide.description,
        slide.note,
        index,
      ),
    );

    const insertCategory = db.prepare(
      'INSERT INTO menu_categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
    );
    const insertProduct = db.prepare(
      `INSERT INTO products (category_id, name, description, media_id, dietary, is_featured, featured_order, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    let featuredOrder = 0;
    SEED_MENU.forEach((category, categoryIndex) => {
      const { lastInsertRowid } = insertCategory.run(
        category.name,
        category.slug,
        category.description,
        categoryIndex,
      );
      category.products.forEach((product, productIndex) => {
        insertProduct.run(
          lastInsertRowid,
          product.name,
          product.description,
          imageId(product.image),
          product.dietary ?? '',
          product.featured ? 1 : 0,
          product.featured ? featuredOrder++ : 0,
          productIndex,
        );
      });
    });

    const insertGalleryCategory = db.prepare(
      'INSERT INTO gallery_categories (name, slug, sort_order) VALUES (?, ?, ?)',
    );
    const galleryCategoryIds = new Map<string, number | bigint>();
    SEED_GALLERY_CATEGORIES.forEach((category, index) => {
      const { lastInsertRowid } = insertGalleryCategory.run(category.name, category.slug, index);
      galleryCategoryIds.set(category.slug, lastInsertRowid);
    });
    const insertGalleryItem = db.prepare(
      `INSERT INTO gallery_items (media_id, title, alt, category_id, sort_order) VALUES (?, ?, ?, ?, ?)`,
    );
    SEED_GALLERY.forEach((item, index) => {
      const id = imageId(item.image);
      if (id === null) return;
      insertGalleryItem.run(
        id,
        item.title,
        item.alt,
        galleryCategoryIds.get(item.category) ?? null,
        index,
      );
    });

    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(
      SEEDED_MARKER,
      JSON.stringify({ at: new Date().toISOString() }),
    );
  })();
}

/** Copies the encoded seed photographs into the media store and registers them. */
function loadSeedMedia(db: Database.Database): Set<string> {
  const root = seedMediaRoot();
  const manifestPath = path.join(root, 'manifest.json');
  const loaded = new Set<string>();
  if (!existsSync(manifestPath)) {
    console.warn(`[seed] ${manifestPath} not found; starting without the seed photographs.`);
    return loaded;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, ManifestEntry>;
  const insert = db.prepare(
    `INSERT OR IGNORE INTO media (id, original_name, width, height, color, widths, bytes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const [key, entry] of Object.entries(manifest)) {
    const id = `seed-${key}`;
    const source = path.join(root, key);
    if (!existsSync(source)) continue;
    cpSync(source, mediaDir(id), { recursive: true });
    insert.run(
      id,
      `${key}.jpg`,
      entry.width,
      entry.height,
      entry.color,
      JSON.stringify(entry.widths),
      entry.bytes,
    );
    loaded.add(key);
  }
  return loaded;
}
