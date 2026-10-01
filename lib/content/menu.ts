import 'server-only';
import { db } from '@/lib/db/client';
import { nextPosition } from '@/lib/db/ordering';
import { uniqueSlug } from '@/lib/format/slug';
import { parseDietary } from './dietary';
import { MEDIA_JOIN_COLUMNS, assetFromJoin, type JoinedMediaColumns } from './media';
import type { DietaryTag, MenuCategory, MenuSection, Product } from './types';

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: number;
}

interface ProductRow extends JoinedMediaColumns {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number | null;
  price_note: string;
  allergens: string;
  dietary: string;
  is_featured: number;
  featured_order: number;
  is_available: number;
  sort_order: number;
}

const PRODUCT_SELECT = `SELECT p.*, ${MEDIA_JOIN_COLUMNS} FROM products p LEFT JOIN media m ON m.id = p.media_id`;

function toCategory(row: CategoryRow): MenuCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active === 1,
  };
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    price: row.price,
    priceNote: row.price_note,
    image: assetFromJoin(row),
    allergens: row.allergens,
    dietary: parseDietary(row.dietary),
    isFeatured: row.is_featured === 1,
    featuredOrder: row.featured_order,
    isAvailable: row.is_available === 1,
    sortOrder: row.sort_order,
  };
}

/* ── Public reads ─────────────────────────────────────────────────────────────────────── */

/** The published menu: active categories that have at least one product, in order. */
export function listMenu(): MenuSection[] {
  const database = db();
  const categories = (
    database
      .prepare('SELECT * FROM menu_categories WHERE is_active = 1 ORDER BY sort_order, id')
      .all() as CategoryRow[]
  ).map(toCategory);
  const products = (
    database.prepare(`${PRODUCT_SELECT} ORDER BY p.sort_order, p.id`).all() as ProductRow[]
  ).map(toProduct);

  return categories
    .map((category) => ({
      ...category,
      products: products.filter((product) => product.categoryId === category.id),
    }))
    .filter((section) => section.products.length > 0);
}

/** Featured products for the home page: available, in an active category, in featured order. */
export function listFeaturedProducts(): (Product & { categoryName: string })[] {
  const rows = db()
    .prepare(
      `SELECT p.*, c.name AS category_name, ${MEDIA_JOIN_COLUMNS}
       FROM products p
       JOIN menu_categories c ON c.id = p.category_id AND c.is_active = 1
       LEFT JOIN media m ON m.id = p.media_id
       WHERE p.is_featured = 1 AND p.is_available = 1
       ORDER BY p.featured_order, p.id`,
    )
    .all() as (ProductRow & { category_name: string })[];
  return rows.map((row) => ({ ...toProduct(row), categoryName: row.category_name }));
}

/* ── Categories ───────────────────────────────────────────────────────────────────────── */

export function listCategories(): (MenuCategory & { productCount: number })[] {
  const rows = db()
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
       FROM menu_categories c ORDER BY c.sort_order, c.id`,
    )
    .all() as (CategoryRow & { product_count: number })[];
  return rows.map((row) => ({ ...toCategory(row), productCount: row.product_count }));
}

export function getCategory(id: number): MenuCategory | null {
  const row = db().prepare('SELECT * FROM menu_categories WHERE id = ?').get(id) as
    CategoryRow | undefined;
  return row ? toCategory(row) : null;
}

export interface CategoryInput {
  name: string;
  description: string;
  isActive: boolean;
}

function slugTaken(slug: string, exceptId?: number): boolean {
  return (
    db()
      .prepare('SELECT 1 FROM menu_categories WHERE slug = ? AND id IS NOT ?')
      .get(slug, exceptId ?? null) !== undefined
  );
}

export function createCategory(input: CategoryInput): number {
  const result = db()
    .prepare(
      `INSERT INTO menu_categories (name, slug, description, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      uniqueSlug(input.name, (slug) => slugTaken(slug)),
      input.description,
      input.isActive ? 1 : 0,
      nextPosition('menu_categories'),
    );
  return Number(result.lastInsertRowid);
}

export function updateCategory(id: number, input: CategoryInput): void {
  db()
    .prepare(
      'UPDATE menu_categories SET name = ?, slug = ?, description = ?, is_active = ? WHERE id = ?',
    )
    .run(
      input.name,
      uniqueSlug(input.name, (slug) => slugTaken(slug, id)),
      input.description,
      input.isActive ? 1 : 0,
      id,
    );
}

/** A category holding products cannot be deleted; the admin moves or deletes them first. */
export function deleteCategory(id: number): { ok: true } | { ok: false; productCount: number } {
  const database = db();
  const { count } = database
    .prepare('SELECT COUNT(*) AS count FROM products WHERE category_id = ?')
    .get(id) as {
    count: number;
  };
  if (count > 0) return { ok: false, productCount: count };
  database.prepare('DELETE FROM menu_categories WHERE id = ?').run(id);
  return { ok: true };
}

/* ── Products ─────────────────────────────────────────────────────────────────────────── */

export function listProducts(categoryId?: number): Product[] {
  const database = db();
  const rows = (
    categoryId === undefined
      ? database
          .prepare(
            `${PRODUCT_SELECT} JOIN menu_categories c ON c.id = p.category_id ORDER BY c.sort_order, p.sort_order, p.id`,
          )
          .all()
      : database
          .prepare(`${PRODUCT_SELECT} WHERE p.category_id = ? ORDER BY p.sort_order, p.id`)
          .all(categoryId)
  ) as ProductRow[];
  return rows.map(toProduct);
}

export function getProduct(id: number): Product | null {
  const row = db().prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id) as ProductRow | undefined;
  return row ? toProduct(row) : null;
}

export interface ProductInput {
  categoryId: number;
  name: string;
  description: string;
  price: number | null;
  priceNote: string;
  mediaId: string | null;
  allergens: string;
  dietary: DietaryTag[];
  isFeatured: boolean;
  isAvailable: boolean;
}

function productParams(input: ProductInput) {
  return {
    categoryId: input.categoryId,
    name: input.name,
    description: input.description,
    price: input.price,
    priceNote: input.priceNote,
    mediaId: input.mediaId,
    allergens: input.allergens,
    dietary: input.dietary.join(','),
    isFeatured: input.isFeatured ? 1 : 0,
    isAvailable: input.isAvailable ? 1 : 0,
  };
}

export function createProduct(input: ProductInput): number {
  const result = db()
    .prepare(
      `INSERT INTO products (category_id, name, description, price, price_note, media_id, allergens, dietary,
         is_featured, featured_order, is_available, sort_order)
       VALUES (@categoryId, @name, @description, @price, @priceNote, @mediaId, @allergens, @dietary,
         @isFeatured, @featuredOrder, @isAvailable, @sortOrder)`,
    )
    .run({
      ...productParams(input),
      featuredOrder: nextPosition('featured_products'),
      sortOrder: nextPosition('products', input.categoryId),
    });
  return Number(result.lastInsertRowid);
}

export function updateProduct(id: number, input: ProductInput): void {
  const database = db();
  const current = getProduct(id);
  if (!current) return;
  const movedCategory = current.categoryId !== input.categoryId;
  const newlyFeatured = !current.isFeatured && input.isFeatured;
  database
    .prepare(
      `UPDATE products SET category_id = @categoryId, name = @name, description = @description, price = @price,
         price_note = @priceNote, media_id = @mediaId, allergens = @allergens, dietary = @dietary,
         is_featured = @isFeatured, is_available = @isAvailable, featured_order = @featuredOrder,
         sort_order = @sortOrder, updated_at = datetime('now')
       WHERE id = @id`,
    )
    .run({
      ...productParams(input),
      id,
      featuredOrder: newlyFeatured ? nextPosition('featured_products') : current.featuredOrder,
      sortOrder: movedCategory ? nextPosition('products', input.categoryId) : current.sortOrder,
    });
}

export function setProductFlag(id: number, flag: 'featured' | 'available', value: boolean): void {
  const database = db();
  if (flag === 'available') {
    database.prepare('UPDATE products SET is_available = ? WHERE id = ?').run(value ? 1 : 0, id);
    return;
  }
  database
    .prepare('UPDATE products SET is_featured = ?, featured_order = ? WHERE id = ?')
    .run(value ? 1 : 0, value ? nextPosition('featured_products') : 0, id);
}

export function deleteProduct(id: number): string | null {
  const database = db();
  const row = database.prepare('SELECT media_id FROM products WHERE id = ?').get(id) as
    { media_id: string | null } | undefined;
  database.prepare('DELETE FROM products WHERE id = ?').run(id);
  return row?.media_id ?? null;
}
