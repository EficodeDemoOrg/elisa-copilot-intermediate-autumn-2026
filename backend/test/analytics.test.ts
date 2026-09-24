import { describe, it, expect } from 'vitest';
import { computeGaps, computeHeatmap, recommendFor } from '../src/analytics.js';
import type { DatabaseSchema } from '@tsm/shared';

const fixture: DatabaseSchema = {
  skills: [
    { id: 's1', name: 'TypeScript', category: 'Languages', targetLevel: 3 },
    { id: 's2', name: 'Docker', category: 'DevOps', targetLevel: 2 },
  ],
  teams: [{ id: 't1', name: 'Team A' }],
  engineers: [
    { id: 'e1', name: 'Alice', role: 'Dev', teamId: 't1' },
    { id: 'e2', name: 'Bob', role: 'Dev', teamId: 't1' },
  ],
  assessments: [
    { engineerId: 'e1', skillId: 's1', level: 4, updatedAt: 'x' },
    { engineerId: 'e1', skillId: 's2', level: 1, updatedAt: 'x' },
    { engineerId: 'e2', skillId: 's1', level: 2, updatedAt: 'x' },
  ],
  resources: {
    s1: [
      { title: 'TS Basics', url: 'https://x', targetLevel: 2 },
      { title: 'TS Advanced', url: 'https://y', targetLevel: 4 },
    ],
    s2: [{ title: 'Docker 101', url: 'https://z', targetLevel: 2 }],
  },
};

describe('computeHeatmap', () => {
  it('builds a matrix of all team engineers × skills with target flags', () => {
    const h = computeHeatmap(fixture, 't1');
    expect(h.engineers).toHaveLength(2);
    expect(h.skills).toHaveLength(2);
    expect(h.cells).toHaveLength(4);
    const e1s1 = h.cells.find((c) => c.engineerId === 'e1' && c.skillId === 's1')!;
    expect(e1s1.level).toBe(4);
    expect(e1s1.belowTarget).toBe(false);
    const e2s2 = h.cells.find((c) => c.engineerId === 'e2' && c.skillId === 's2')!;
    expect(e2s2.level).toBe(0);
    expect(e2s2.belowTarget).toBe(true);
  });
});

describe('computeGaps', () => {
  it('returns gap sorted desc with average and count below target', () => {
    const gaps = computeGaps(fixture, 't1');
    expect(gaps).toHaveLength(2);
    expect(gaps[0]!.gap).toBeGreaterThanOrEqual(gaps[1]!.gap);
    const s2 = gaps.find((g) => g.skillId === 's2')!;
    expect(s2.averageLevel).toBe(0.5);
    expect(s2.engineersBelowTarget).toBe(2);
  });
});

describe('recommendFor', () => {
  it('suggests skills where current < target with resources above current level', () => {
    const recs = recommendFor(fixture, 'e2');
    const ids = recs.map((r) => r.skillId);
    expect(ids).toContain('s1');
    expect(ids).toContain('s2');
    const s1 = recs.find((r) => r.skillId === 's1')!;
    // e2 is level 2 on s1: only Advanced (>2) should remain
    expect(s1.resources.map((r) => r.title)).toEqual(['TS Advanced']);
  });

  it('omits skills already meeting target', () => {
    const recs = recommendFor(fixture, 'e1');
    expect(recs.find((r) => r.skillId === 's1')).toBeUndefined();
  });
});
