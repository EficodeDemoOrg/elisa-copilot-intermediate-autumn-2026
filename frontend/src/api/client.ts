import type {
  CompetencyLevel,
  Engineer,
  HeatmapData,
  Skill,
  SkillAssessment,
  SkillGap,
  Team,
  TrainingRecommendation,
} from '@tsm/shared';

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // Skills
  listSkills: () => req<Skill[]>('/api/skills'),
  createSkill: (body: Omit<Skill, 'id'>) =>
    req<Skill>('/api/skills', { method: 'POST', body: JSON.stringify(body) }),
  updateSkill: (id: string, body: Partial<Omit<Skill, 'id'>>) =>
    req<Skill>(`/api/skills/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSkill: (id: string) => req<void>(`/api/skills/${id}`, { method: 'DELETE' }),

  // Teams
  listTeams: () => req<Team[]>('/api/teams'),

  // Engineers
  listEngineers: (teamId?: string) =>
    req<Engineer[]>(teamId ? `/api/engineers?teamId=${teamId}` : '/api/engineers'),
  getEngineer: (id: string) => req<Engineer>(`/api/engineers/${id}`),

  // Assessments
  listAssessments: (params: { engineerId?: string; skillId?: string } = {}) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return req<SkillAssessment[]>(`/api/assessments${q ? `?${q}` : ''}`);
  },
  setAssessment: (engineerId: string, skillId: string, level: CompetencyLevel) =>
    req<SkillAssessment>(`/api/assessments/${engineerId}/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify({ level }),
    }),

  // Analytics
  getHeatmap: (teamId: string) =>
    req<HeatmapData>(`/api/analytics/heatmap?teamId=${teamId}`),
  getGaps: (teamId: string) =>
    req<SkillGap[]>(`/api/analytics/gaps?teamId=${teamId}`),

  // Recommendations
  getRecommendations: (engineerId: string) =>
    req<TrainingRecommendation[]>(`/api/recommendations/${engineerId}`),
};
