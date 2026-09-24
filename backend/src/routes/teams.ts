import { Router } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { DB } from '../db.js';
import type { Team } from '@tsm/shared';

const createSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
});

const updateSchema = createSchema.partial();

export function teamsRouter(db: DB): Router {
  const r = Router();

  r.get('/', (_req, res) => res.json(db.data.teams));

  r.get('/:id', (req, res) => {
    const t = db.data.teams.find((x) => x.id === req.params.id);
    if (!t) return res.status(404).json({ error: 'Team not found' });
    res.json(t);
  });

  r.post('/', async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const team: Team = { id: `team_${nanoid(8)}`, ...parsed.data };
    db.data.teams.push(team);
    await db.write();
    res.status(201).json(team);
  });

  r.put('/:id', async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const idx = db.data.teams.findIndex((t) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Team not found' });
    db.data.teams[idx] = { ...db.data.teams[idx]!, ...parsed.data };
    await db.write();
    res.json(db.data.teams[idx]);
  });

  r.delete('/:id', async (req, res) => {
    const before = db.data.teams.length;
    db.data.teams = db.data.teams.filter((t) => t.id !== req.params.id);
    if (db.data.teams.length === before) return res.status(404).json({ error: 'Team not found' });
    await db.write();
    res.status(204).end();
  });

  return r;
}
