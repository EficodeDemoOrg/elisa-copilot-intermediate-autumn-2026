import { Router } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { DB } from '../db.js';
import type { CompetencyLevel, Skill } from '@tsm/shared';

const competencySchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

const skillCreateSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(40),
  description: z.string().max(500).optional(),
  targetLevel: competencySchema.default(3 as CompetencyLevel),
});

const skillUpdateSchema = skillCreateSchema.partial();

export function skillsRouter(db: DB): Router {
  const r = Router();

  r.get('/', (_req, res) => {
    res.json(db.data.skills);
  });

  r.post('/', async (req, res) => {
    const parsed = skillCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const skill: Skill = { id: `skl_${nanoid(8)}`, ...parsed.data } as Skill;
    db.data.skills.push(skill);
    await db.write();
    res.status(201).json(skill);
  });

  r.put('/:id', async (req, res) => {
    const parsed = skillUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const idx = db.data.skills.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Skill not found' });
    db.data.skills[idx] = { ...db.data.skills[idx]!, ...parsed.data } as Skill;
    await db.write();
    res.json(db.data.skills[idx]);
  });

  r.delete('/:id', async (req, res) => {
    const before = db.data.skills.length;
    db.data.skills = db.data.skills.filter((s) => s.id !== req.params.id);
    db.data.assessments = db.data.assessments.filter((a) => a.skillId !== req.params.id);
    if (db.data.skills.length === before) return res.status(404).json({ error: 'Skill not found' });
    await db.write();
    res.status(204).end();
  });

  return r;
}
