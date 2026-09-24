import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { LevelPicker } from '../components/LevelPicker.js';
import type { CompetencyLevel } from '@tsm/shared';

export function EngineerDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const engineerId = id!;
  const qc = useQueryClient();

  const engineer = useQuery({ queryKey: ['engineer', engineerId], queryFn: () => api.getEngineer(engineerId) });
  const skills = useQuery({ queryKey: ['skills'], queryFn: api.listSkills });
  const assessments = useQuery({
    queryKey: ['assessments', { engineerId }],
    queryFn: () => api.listAssessments({ engineerId }),
  });

  const setLevel = useMutation({
    mutationFn: ({ skillId, level }: { skillId: string; level: CompetencyLevel }) =>
      api.setAssessment(engineerId, skillId, level),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
      qc.invalidateQueries({ queryKey: ['heatmap'] });
      qc.invalidateQueries({ queryKey: ['gaps'] });
    },
  });

  const levelOf = (skillId: string): CompetencyLevel =>
    (assessments.data?.find((a) => a.skillId === skillId)?.level ?? 0) as CompetencyLevel;

  return (
    <div>
      <h1>{engineer.data?.name ?? 'Engineer'}</h1>
      <p className="subtitle">
        {engineer.data?.role} ·{' '}
        <Link to={`/engineers/${engineerId}/recommendations`}>Training recommendations →</Link>
      </p>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Skill</th>
              <th>Category</th>
              <th>Target</th>
              <th>Current</th>
            </tr>
          </thead>
          <tbody>
            {skills.data?.map((s) => {
              const cur = levelOf(s.id);
              const below = cur < s.targetLevel;
              return (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td><span className="badge">{s.category}</span></td>
                  <td>{s.targetLevel}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <LevelPicker
                        level={cur}
                        ariaLabel={`${s.name} level`}
                        onChange={(level) => setLevel.mutate({ skillId: s.id, level })}
                      />
                      {below ? <span className="badge accent">below target</span> : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
