import { Router } from 'express';
import type { DB } from '../db.js';
import { recommendFor } from '../analytics.js';

export function recommendationsRouter(db: DB): Router {
  const r = Router();

  r.get('/:engineerId', (req, res) => {
    const { engineerId } = req.params;
    if (!db.data.engineers.some((e) => e.id === engineerId)) {
      return res.status(404).json({ error: 'Engineer not found' });
    }
    res.json(recommendFor(db.data, engineerId));
  });

  return r;
}
