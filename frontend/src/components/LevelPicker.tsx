import { COMPETENCY_LEVELS, type CompetencyLevel } from '@tsm/shared';

interface Props {
  level: CompetencyLevel;
  onChange?: (level: CompetencyLevel) => void;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

export function LevelPicker({ level, onChange, size = 'md', ariaLabel }: Props): JSX.Element {
  if (!onChange) {
    return (
      <span className="level-pill" aria-label={ariaLabel}>
        {COMPETENCY_LEVELS.map((l) => (
          <span key={l} className={`dot ${l <= level ? 'on' : ''}`} />
        ))}
      </span>
    );
  }
  return (
    <select
      value={level}
      onChange={(e) => onChange(Number(e.target.value) as CompetencyLevel)}
      aria-label={ariaLabel}
      style={{ minWidth: size === 'sm' ? 60 : 100 }}
    >
      {COMPETENCY_LEVELS.map((l) => (
        <option key={l} value={l}>
          {l} — {labelFor(l)}
        </option>
      ))}
    </select>
  );
}

function labelFor(l: CompetencyLevel): string {
  return ['None', 'Novice', 'Working', 'Proficient', 'Expert'][l]!;
}
