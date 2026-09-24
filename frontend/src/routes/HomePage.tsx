import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export function HomePage(): JSX.Element {
  const teams = useQuery({ queryKey: ['teams'], queryFn: api.listTeams });
  const skills = useQuery({ queryKey: ['skills'], queryFn: api.listSkills });
  const engineers = useQuery({ queryKey: ['engineers'], queryFn: () => api.listEngineers() });

  return (
    <div>
      <h1>Team Skills Matrix</h1>
      <p className="subtitle">
        Inventory your engineering skills, track proficiency, surface gaps, and recommend training.
      </p>

      <div className="row" style={{ gap: 16, marginBottom: 24 }}>
        <Stat label="Teams" value={teams.data?.length ?? '—'} />
        <Stat label="Engineers" value={engineers.data?.length ?? '—'} />
        <Stat label="Skills tracked" value={skills.data?.length ?? '—'} />
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Jump to a team</h2>
        <div className="stack">
          {teams.data?.map((t) => (
            <div key={t.id} className="row">
              <strong style={{ minWidth: 140 }}>{t.name}</strong>
              <span className="muted">{t.description}</span>
              <span className="spacer" />
              <Link to={`/teams/${t.id}/heatmap`}>Heatmap →</Link>
              <Link to={`/teams/${t.id}/gaps`}>Gaps →</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }): JSX.Element {
  return (
    <div className="card" style={{ minWidth: 160 }}>
      <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}
