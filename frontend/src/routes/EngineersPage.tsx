import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export function EngineersPage(): JSX.Element {
  const teams = useQuery({ queryKey: ['teams'], queryFn: api.listTeams });
  const [teamFilter, setTeamFilter] = useState<string>('');
  const engineers = useQuery({
    queryKey: ['engineers', teamFilter],
    queryFn: () => api.listEngineers(teamFilter || undefined),
  });

  const teamName = (id: string) => teams.data?.find((t) => t.id === id)?.name ?? id;

  return (
    <div>
      <h1>Engineers</h1>
      <p className="subtitle">Browse engineers across teams and drill into individual skill profiles.</p>

      <div className="card stack">
        <div className="toolbar">
          <label className="muted">Team:</label>
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="">All teams</option>
            {teams.data?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <span className="spacer" />
          <span className="muted">{engineers.data?.length ?? 0} engineers</span>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Team</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {engineers.data?.map((e) => (
              <tr key={e.id}>
                <td><strong>{e.name}</strong></td>
                <td>{e.role}</td>
                <td><span className="badge primary">{teamName(e.teamId)}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <Link to={`/engineers/${e.id}`}>Profile →</Link>
                  &nbsp;&nbsp;
                  <Link to={`/engineers/${e.id}/recommendations`}>Training →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
