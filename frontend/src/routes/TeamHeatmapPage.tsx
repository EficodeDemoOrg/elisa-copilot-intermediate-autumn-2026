import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Heatmap } from '../components/Heatmap.js';

export function TeamHeatmapPage(): JSX.Element {
  const { teamId } = useParams<{ teamId: string }>();
  const tid = teamId!;
  const teams = useQuery({ queryKey: ['teams'], queryFn: api.listTeams });
  const heatmap = useQuery({ queryKey: ['heatmap', tid], queryFn: () => api.getHeatmap(tid) });

  const team = teams.data?.find((t) => t.id === tid);

  return (
    <div>
      <h1>{team?.name ?? 'Team'} — Heatmap</h1>
      <p className="subtitle">
        Click any cell to advance the engineer's level (cycles 0 → 4). Orange dot marks below-target cells.{' '}
        <Link to={`/teams/${tid}/gaps`}>View gap analysis →</Link>
      </p>

      <div className="card" data-testid="heatmap-card">
        {heatmap.isLoading ? <span className="muted">Loading…</span> : null}
        {heatmap.isError ? <span className="error">Failed to load heatmap.</span> : null}
        {heatmap.data ? <Heatmap data={heatmap.data} /> : null}
      </div>
    </div>
  );
}
