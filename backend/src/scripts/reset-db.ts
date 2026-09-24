import fs from 'node:fs';
import { defaultDbPath } from '../db.js';

const target = defaultDbPath();
if (fs.existsSync(target)) {
  fs.rmSync(target);
  // eslint-disable-next-line no-console
  console.log(`[seed:reset] removed ${target}`);
} else {
  // eslint-disable-next-line no-console
  console.log(`[seed:reset] nothing to remove at ${target}`);
}
