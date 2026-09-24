import { Router } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { DB } from '../db.js';
import type { Engineer } from '@tsm/shared';

const createSchema = z.object({
  name: z.string().min(1).max(80),
  role: z.string().min(1).max(80),
  teamId: z.string().min(1),
});

const updateSchema = createSchema.partial();

export function engineersRouter(db: DB): Router {
  const r = Router();

  r.get('/', (req, res) => {
    const teamId = typeof req.query.teamId === 'string' ? req.query.teamId : undefined;
    const items = teamId
      ? db.data.engineers.filter((e) => e.teamId === teamId)
      : db.data.engineers;
    res.json(items);
  });

  r.get('/:id', (req, res) => {
    const eng = db.data.engineers.find((e) => e.id === req.params.id);
    if (!eng) return res.status(404).json({ error: 'Engineer not found' });
    res.json(eng);
  });

  r.post('/', async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (!db.data.teams.some((t) => t.id === parsed.data.teamId)) {
      return res.status(400).json({ error: 'Unknown teamId' });
    }
    const eng: Engineer = { id: `eng_${nanoid(8)}`, ...parsed.data };
    db.data.engineers.push(eng);
    await db.write();
    res.status(201).json(eng);
  });

  r.put('/:id', async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const idx = db.data.engineers.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Engineer not found' });
    db.data.engineers[idx] = { ...db.data.engineers[idx]!, ...parsed.data };
    await db.write();
    res.json(db.data.engineers[idx]);
  });

  r.delete('/:id', async (req, res) => {
    const before = db.data.engineers.length;
    db.data.engineers = db.data.engineers.filter((e) => e.id !== req.params.id);
    db.data.assessments = db.data.assessments.filter((a) => a.engineerId !== req.params.id);
    if (db.data.engineers.length === before) return res.status(404).json({ error: 'Engineer not found' });
    await db.write();
    res.status(204).end();
  });

  return r;
}
