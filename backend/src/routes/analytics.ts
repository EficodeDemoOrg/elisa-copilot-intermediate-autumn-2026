import { Router } from 'express';
import type { DB } from '../db.js';
import { computeGaps, computeHeatmap } from '../analytics.js';

export function analyticsRouter(db: DB): Router {
  const r = Router();

  r.get('/heatmap', (req, res) => {
    const teamId = req.query.teamId;
    if (typeof teamId !== 'string') return res.status(400).json({ error: 'teamId query param required' });
    if (!db.data.teams.some((t) => t.id === teamId)) return res.status(404).json({ error: 'Team not found' });
    res.json(computeHeatmap(db.data, teamId));
  });

  r.get('/gaps', (req, res) => {
    const teamId = req.query.teamId;
    if (typeof teamId !== 'string') return res.status(400).json({ error: 'teamId query param required' });
    if (!db.data.teams.some((t) => t.id === teamId)) return res.status(404).json({ error: 'Team not found' });
    res.json(computeGaps(db.data, teamId));
  });

  return r;
}
