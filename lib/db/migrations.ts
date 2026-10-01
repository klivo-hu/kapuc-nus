import type Database from 'better-sqlite3';

/**
 * Schema migrations, applied in order and tracked with SQLite's `user_version`. Append a new
 * entry to change the schema; never edit one that has shipped.
 */
const MIGRATIONS: readonly string[] = [
  /* 1 — initial schema */ `
  CREATE TABLE media (
    id            TEXT PRIMARY KEY,
    original_name TEXT    NOT NULL,
    width         INTEGER NOT NULL,
    height        INTEGER NOT NULL,
    color         TEXT    NOT NULL,
    widths        TEXT    NOT NULL,
    bytes         INTEGER NOT NULL,
    focal_x       REAL    NOT NULL DEFAULT 50,
    focal_y       REAL    NOT NULL DEFAULT 50,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE hero_slides (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id    TEXT    REFERENCES media(id) ON DELETE SET NULL,
    image_alt   TEXT    NOT NULL DEFAULT '',
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    note        TEXT    NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE menu_categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    slug        TEXT    NOT NULL UNIQUE,
    description TEXT    NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE products (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id    INTEGER NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
    name           TEXT    NOT NULL,
    description    TEXT    NOT NULL DEFAULT '',
    price          INTEGER,
    price_note     TEXT    NOT NULL DEFAULT '',
    media_id       TEXT    REFERENCES media(id) ON DELETE SET NULL,
    allergens      TEXT    NOT NULL DEFAULT '',
    dietary        TEXT    NOT NULL DEFAULT '',
    is_featured    INTEGER NOT NULL DEFAULT 0,
    featured_order INTEGER NOT NULL DEFAULT 0,
    is_available   INTEGER NOT NULL DEFAULT 1,
    sort_order     INTEGER NOT NULL DEFAULT 0,
    updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX products_category ON products(category_id, sort_order);
  CREATE INDEX products_featured ON products(is_featured, featured_order);

  CREATE TABLE gallery_categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    slug       TEXT    NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE gallery_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id    TEXT    NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL DEFAULT '',
    alt         TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    category_id INTEGER REFERENCES gallery_categories(id) ON DELETE SET NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX gallery_order ON gallery_items(is_active, sort_order);

  CREATE TABLE settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE sessions (
    token_hash TEXT    PRIMARY KEY,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
  `,
];

export function migrate(db: Database.Database): void {
  const current = db.pragma('user_version', { simple: true }) as number;
  for (let version = current; version < MIGRATIONS.length; version++) {
    const sql = MIGRATIONS[version];
    if (sql === undefined) break;
    db.transaction(() => {
      db.exec(sql);
      db.pragma(`user_version = ${version + 1}`);
    })();
  }
}
