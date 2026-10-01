import 'server-only';
import { db } from '@/lib/db/client';
import {
  SETTINGS_SCHEMAS,
  parseSettings,
  type Settings,
  type SettingsKey,
} from './settings-schema';

export function getSettings<K extends SettingsKey>(key: K): Settings[K] {
  const row = db().prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    { value: string } | undefined;
  if (!row) return parseSettings(key, undefined);
  try {
    return parseSettings(key, JSON.parse(row.value));
  } catch {
    return parseSettings(key, undefined);
  }
}

/** Every group at once, for pages (and the footer) that need several. */
export function getAllSettings(): Settings {
  return {
    site: getSettings('site'),
    about: getSettings('about'),
    aboutPage: getSettings('aboutPage'),
    social: getSettings('social'),
    location: getSettings('location'),
    operator: getSettings('operator'),
    legal: getSettings('legal'),
  };
}

/** Validates and stores a settings group. Returns the stored (normalized) value. */
export function saveSettings<K extends SettingsKey>(key: K, value: unknown): Settings[K] {
  const parsed = SETTINGS_SCHEMAS[key].parse(value) as Settings[K];
  db()
    .prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(key, JSON.stringify(parsed));
  return parsed;
}
