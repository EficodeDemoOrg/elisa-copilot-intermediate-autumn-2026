import type { SkillGap } from '@tsm/shared';

interface Props {
  gaps: SkillGap[];
  maxLevel?: number;
}

export function GapBars({ gaps, maxLevel = 4 }: Props): JSX.Element {
  return (
    <div className="stack">
      {gaps.map((g) => {
        const pct = Math.max(0, Math.min(100, (g.gap / maxLevel) * 100));
        return (
          <div key={g.skillId} className="gap-bar-row" data-testid={`gap-${g.skillId}`}>
            <div>
              <div style={{ fontWeight: 600 }}>{g.skillName}</div>
              <div className="muted" style={{ fontSize: 11 }}>
                target {g.targetLevel} · avg {g.averageLevel} · {g.engineersBelowTarget} below
              </div>
            </div>
            <div className="gap-bar-track" aria-label={`Gap ${g.gap}`}>
              <div className="gap-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ textAlign: 'right', fontWeight: 700, color: g.gap > 0 ? 'var(--color-accent)' : 'var(--color-primary)' }}>
              {g.gap > 0 ? `+${g.gap}` : g.gap}
            </div>
          </div>
        );
      })}
    </div>
  );
}
