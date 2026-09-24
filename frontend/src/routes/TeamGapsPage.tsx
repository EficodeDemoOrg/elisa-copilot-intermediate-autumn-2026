import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { GapBars } from '../components/GapBars.js';

export function TeamGapsPage(): JSX.Element {
  const { teamId } = useParams<{ teamId: string }>();
  const tid = teamId!;
  const teams = useQuery({ queryKey: ['teams'], queryFn: api.listTeams });
  const gaps = useQuery({ queryKey: ['gaps', tid], queryFn: () => api.getGaps(tid) });
  const team = teams.data?.find((t) => t.id === tid);

  return (
    <div>
      <h1>{team?.name ?? 'Team'} — Skill Gaps</h1>
      <p className="subtitle">
        Skills sorted by largest gap (target − average). <Link to={`/teams/${tid}/heatmap`}>Back to heatmap →</Link>
      </p>
      <div className="card">
        {gaps.isLoading ? <span className="muted">Loading…</span> : null}
        {gaps.data ? <GapBars gaps={gaps.data} /> : null}
      </div>
    </div>
  );
}
