import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { levelToBg, levelToFg } from '../lib/colors.js';
import type { CompetencyLevel, HeatmapData } from '@tsm/shared';

interface Props {
  data: HeatmapData;
}

export function Heatmap({ data }: Props): JSX.Element {
  const qc = useQueryClient();
  const setLevel = useMutation({
    mutationFn: ({ engineerId, skillId, level }: { engineerId: string; skillId: string; level: CompetencyLevel }) =>
      api.setAssessment(engineerId, skillId, level),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['heatmap', data.teamId] });
      qc.invalidateQueries({ queryKey: ['gaps', data.teamId] });
      qc.invalidateQueries({ queryKey: ['assessments'] });
    },
  });

  const cols = data.skills.length;
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `180px repeat(${cols}, minmax(44px, 1fr))`,
  };

  const cellOf = (engineerId: string, skillId: string) =>
    data.cells.find((c) => c.engineerId === engineerId && c.skillId === skillId)!;

  const cycle = (current: CompetencyLevel): CompetencyLevel =>
    (((current + 1) % 5) as CompetencyLevel);

  return (
    <div className="heatmap-wrap">
      <div className="heatmap" style={gridStyle} role="grid" aria-label="Team skill heatmap">
        <div className="hrow" aria-hidden="true" />
        {data.skills.map((s) => (
          <div key={s.id} className="hhead" title={s.name}>{s.name}</div>
        ))}
        {data.engineers.map((e) => (
          <FragmentRow
            key={e.id}
            name={e.name}
            cells={data.skills.map((s) => {
              const c = cellOf(e.id, s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`hcell ${c.belowTarget ? 'gap' : ''}`}
                  style={{ background: levelToBg(c.level), color: levelToFg(c.level) }}
                  aria-label={`${e.name} — ${s.name}: level ${c.level}${c.belowTarget ? ', below target' : ''}`}
                  data-testid={`cell-${e.id}-${s.id}`}
                  onClick={() => setLevel.mutate({ engineerId: e.id, skillId: s.id, level: cycle(c.level) })}
                  title="Click to advance level"
                >
                  {c.level}
                </button>
              );
            })}
          />
        ))}
      </div>
      <div className="legend" style={{ marginTop: 12 }}>
        <span>Level:</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="legend">
            <span className="swatch" style={{ background: levelToBg(l as CompetencyLevel) }} />
            {l}
          </span>
        ))}
        <span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span className="swatch" style={{ background: 'var(--color-accent)' }} /> below target
        </span>
      </div>
    </div>
  );
}

function FragmentRow({ name, cells }: { name: string; cells: React.ReactNode[] }): JSX.Element {
  return (
    <>
      <div className="hrow">{name}</div>
      {cells}
    </>
  );
}
