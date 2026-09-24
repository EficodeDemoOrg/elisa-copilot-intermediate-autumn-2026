import type { CompetencyLevel } from '@tsm/shared';

/**
 * Map a competency level (0–4) to a teal-tinted background color.
 * Level 0 stays neutral surface; higher levels grow more saturated.
 */
export function levelToBg(level: CompetencyLevel): string {
  switch (level) {
    case 0: return '#273449';
    case 1: return '#0f766e33';
    case 2: return '#0d948866';
    case 3: return '#14b8a6';
    case 4: return '#5eead4';
  }
}

export function levelToFg(level: CompetencyLevel): string {
  // Light text on dark cells, dark text on bright cells.
  return level >= 3 ? '#04221f' : '#f1f5f9';
}
