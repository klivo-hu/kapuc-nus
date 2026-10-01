import 'server-only';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from '@/lib/env';
import { mediaRoot } from '@/lib/media/paths';
import { migrate } from './migrations';
import { seedIfEmpty } from './seed';

/**
 * The one SQLite connection. better-sqlite3 is synchronous and the site is served by a single
 * Node process, so one connection in WAL mode serves every request; the handle is kept on
 * globalThis so development hot reloads do not open a new one per edit.
 */
const holder = globalThis as unknown as { kapucinusDb?: Database.Database };

export function db(): Database.Database {
  if (holder.kapucinusDb) return holder.kapucinusDb;

  mkdirSync(env.dataDir, { recursive: true });
  mkdirSync(mediaRoot(), { recursive: true });

  const connection = new Database(path.join(env.dataDir, 'kapucinus.db'));
  connection.pragma('journal_mode = WAL');
  connection.pragma('synchronous = NORMAL');
  connection.pragma('foreign_keys = ON');
  connection.pragma('busy_timeout = 5000');

  migrate(connection);
  seedIfEmpty(connection);

  holder.kapucinusDb = connection;
  return connection;
}
