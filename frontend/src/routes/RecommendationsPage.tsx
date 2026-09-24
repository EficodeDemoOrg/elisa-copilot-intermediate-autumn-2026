import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

export function RecommendationsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const engineerId = id!;
  const engineer = useQuery({ queryKey: ['engineer', engineerId], queryFn: () => api.getEngineer(engineerId) });
  const recs = useQuery({
    queryKey: ['recommendations', engineerId],
    queryFn: () => api.getRecommendations(engineerId),
  });

  return (
    <div>
      <h1>Training — {engineer.data?.name ?? '…'}</h1>
      <p className="subtitle">
        Suggested resources for skills below team target. <Link to={`/engineers/${engineerId}`}>← Profile</Link>
      </p>

      {recs.data?.length === 0 ? (
        <div className="card">
          <span className="muted">All skills meet or exceed the team target — nothing to recommend.</span>
        </div>
      ) : null}

      <div className="stack">
        {recs.data?.map((r) => (
          <div key={r.skillId} className="card">
            <div className="row">
              <h2 style={{ margin: 0 }}>{r.skillName}</h2>
              <span className="badge accent">current {r.currentLevel} → target {r.targetLevel}</span>
            </div>
            <ul style={{ marginTop: 10 }}>
              {r.resources.map((res) => (
                <li key={res.url}>
                  <a href={res.url} target="_blank" rel="noreferrer">{res.title}</a>
                  <span className="muted"> — recommended for level {res.targetLevel}+</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
