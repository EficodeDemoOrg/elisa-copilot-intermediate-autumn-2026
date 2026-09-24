import type {
  CompetencyLevel,
  DatabaseSchema,
  HeatmapData,
  SkillGap,
  TrainingRecommendation,
} from '@tsm/shared';

type DB = Pick<DatabaseSchema, 'skills' | 'engineers' | 'assessments' | 'resources'>;

function levelOf(
  assessments: DatabaseSchema['assessments'],
  engineerId: string,
  skillId: string,
): CompetencyLevel {
  const a = assessments.find((x) => x.engineerId === engineerId && x.skillId === skillId);
  return (a?.level ?? 0) as CompetencyLevel;
}

export function computeHeatmap(
  data: DatabaseSchema,
  teamId: string,
): HeatmapData {
  const engineers = data.engineers.filter((e) => e.teamId === teamId);
  const skills = [...data.skills].sort((a, b) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );
  const cells = engineers.flatMap((e) =>
    skills.map((s) => {
      const level = levelOf(data.assessments, e.id, s.id);
      return {
        engineerId: e.id,
        skillId: s.id,
        level,
        belowTarget: level < s.targetLevel,
      };
    }),
  );
  return { teamId, engineers, skills, cells };
}

export function computeGaps(data: DatabaseSchema, teamId: string): SkillGap[] {
  const engineers = data.engineers.filter((e) => e.teamId === teamId);
  if (engineers.length === 0) {
    return data.skills.map((s) => ({
      skillId: s.id,
      skillName: s.name,
      targetLevel: s.targetLevel,
      averageLevel: 0,
      gap: s.targetLevel,
      engineersBelowTarget: 0,
    }));
  }
  return data.skills
    .map((s) => {
      const levels: number[] = engineers.map((e) => levelOf(data.assessments, e.id, s.id) as number);
      const avg = levels.reduce<number>((acc, l) => acc + l, 0) / levels.length;
      const below = levels.filter((l) => l < s.targetLevel).length;
      return {
        skillId: s.id,
        skillName: s.name,
        targetLevel: s.targetLevel,
        averageLevel: Number(avg.toFixed(2)),
        gap: Number((s.targetLevel - avg).toFixed(2)),
        engineersBelowTarget: below,
      };
    })
    .sort((a, b) => b.gap - a.gap);
}

export function recommendFor(
  data: DB,
  engineerId: string,
): TrainingRecommendation[] {
  return data.skills
    .map((skill) => {
      const current = levelOf(data.assessments as any, engineerId, skill.id);
      if (current >= skill.targetLevel) return null;
      const resources = (data.resources[skill.id] ?? []).filter(
        (r) => current < r.targetLevel,
      );
      if (resources.length === 0) return null;
      return {
        skillId: skill.id,
        skillName: skill.name,
        currentLevel: current,
        targetLevel: skill.targetLevel,
        resources,
      } satisfies TrainingRecommendation;
    })
    .filter((r): r is TrainingRecommendation => r !== null)
    .sort((a, b) => b.targetLevel - b.currentLevel - (a.targetLevel - a.currentLevel));
}
