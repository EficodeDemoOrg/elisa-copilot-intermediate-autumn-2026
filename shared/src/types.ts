export const COMPETENCY_LEVELS = [0, 1, 2, 3, 4] as const;
export type CompetencyLevel = (typeof COMPETENCY_LEVELS)[number];

export const COMPETENCY_LABELS: Record<CompetencyLevel, string> = {
  0: 'None',
  1: 'Novice',
  2: 'Working',
  3: 'Proficient',
  4: 'Expert',
};

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  /** Team-wide target proficiency for gap analysis (default 3). */
  targetLevel: CompetencyLevel;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
}

export interface Engineer {
  id: string;
  name: string;
  role: string;
  teamId: string;
}

export interface SkillAssessment {
  engineerId: string;
  skillId: string;
  level: CompetencyLevel;
  updatedAt: string;
}

export interface TrainingResource {
  title: string;
  url: string;
  /** Minimum recommended level — only suggest if engineer is below this. */
  targetLevel: CompetencyLevel;
}

export interface TrainingRecommendation {
  skillId: string;
  skillName: string;
  currentLevel: CompetencyLevel;
  targetLevel: CompetencyLevel;
  resources: TrainingResource[];
}

export interface HeatmapCell {
  engineerId: string;
  skillId: string;
  level: CompetencyLevel;
  belowTarget: boolean;
}

export interface HeatmapData {
  teamId: string;
  engineers: Engineer[];
  skills: Skill[];
  cells: HeatmapCell[];
}

export interface SkillGap {
  skillId: string;
  skillName: string;
  targetLevel: CompetencyLevel;
  averageLevel: number;
  gap: number;
  engineersBelowTarget: number;
}

export interface DatabaseSchema {
  skills: Skill[];
  teams: Team[];
  engineers: Engineer[];
  assessments: SkillAssessment[];
  resources: Record<string, TrainingResource[]>;
}
