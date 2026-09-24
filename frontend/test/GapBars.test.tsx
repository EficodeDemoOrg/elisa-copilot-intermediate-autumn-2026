import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GapBars } from '../src/components/GapBars.js';
import type { SkillGap } from '@tsm/shared';

const gaps: SkillGap[] = [
  { skillId: 's1', skillName: 'TypeScript', targetLevel: 3, averageLevel: 1.5, gap: 1.5, engineersBelowTarget: 3 },
  { skillId: 's2', skillName: 'Docker',     targetLevel: 2, averageLevel: 2.0, gap: 0,   engineersBelowTarget: 0 },
];

function renderWithClient(node: React.ReactElement) {
  const qc = new QueryClient();
  return render(<QueryClientProvider client={qc}>{node}</QueryClientProvider>);
}

describe('GapBars', () => {
  it('renders one row per gap with the skill name and gap value', () => {
    renderWithClient(<GapBars gaps={gaps} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByTestId('gap-s1')).toBeInTheDocument();
    expect(screen.getByText('+1.5')).toBeInTheDocument();
  });
});
