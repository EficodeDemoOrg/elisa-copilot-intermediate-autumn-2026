import { Router } from 'express';
import { z } from 'zod';
import type { DB } from '../db.js';
import type { CompetencyLevel, SkillAssessment } from '@tsm/shared';

const levelSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const bodySchema = z.object({ level: levelSchema });

export function assessmentsRouter(db: DB): Router {
  const r = Router();

  r.get('/', (req, res) => {
    const { engineerId, skillId } = req.query as { engineerId?: string; skillId?: string };
    let items = db.data.assessments;
    if (engineerId) items = items.filter((a) => a.engineerId === engineerId);
    if (skillId) items = items.filter((a) => a.skillId === skillId);
    res.json(items);
  });

  r.put('/:engineerId/:skillId', async (req, res) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { engineerId, skillId } = req.params;

    if (!db.data.engineers.some((e) => e.id === engineerId)) {
      return res.status(404).json({ error: 'Engineer not found' });
    }
    if (!db.data.skills.some((s) => s.id === skillId)) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const level = parsed.data.level as CompetencyLevel;
    const now = new Date().toISOString();
    const existing = db.data.assessments.find(
      (a) => a.engineerId === engineerId && a.skillId === skillId,
    );
    let result: SkillAssessment;
    if (existing) {
      existing.level = level;
      existing.updatedAt = now;
      result = existing;
    } else {
      result = { engineerId, skillId, level, updatedAt: now };
      db.data.assessments.push(result);
    }
    await db.write();
    res.json(result);
  });

  return r;
}
