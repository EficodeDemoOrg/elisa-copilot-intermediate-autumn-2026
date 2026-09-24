import { JSONFilePreset } from 'lowdb/node';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { DatabaseSchema } from '@tsm/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_PATH = path.resolve(__dirname, 'seed.json');

export function loadSeed(): DatabaseSchema {
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  return JSON.parse(raw) as DatabaseSchema;
}

export function defaultDbPath(): string {
  if (process.env.TSM_DB_PATH) return path.resolve(process.env.TSM_DB_PATH);
  return path.resolve(__dirname, '../data/db.json');
}

export type DB = Awaited<ReturnType<typeof JSONFilePreset<DatabaseSchema>>>;

export async function createDb(dbPath: string = defaultDbPath()): Promise<DB> {
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });
  const seed = loadSeed();
  const db = await JSONFilePreset<DatabaseSchema>(dbPath, seed);
  // If file existed but is missing a key (older format), heal it.
  let mutated = false;
  for (const key of Object.keys(seed) as (keyof DatabaseSchema)[]) {
    if (db.data[key] === undefined) {
      (db.data as any)[key] = (seed as any)[key];
      mutated = true;
    }
  }
  if (mutated) await db.write();
  return db;
}
