import { describe, it, expect } from 'vitest';
import { levelToBg, levelToFg } from '../src/lib/colors.js';

describe('levelToBg', () => {
  it('returns a distinct color per level', () => {
    const colors = new Set([0, 1, 2, 3, 4].map((l) => levelToBg(l as 0 | 1 | 2 | 3 | 4)));
    expect(colors.size).toBe(5);
  });
});

describe('levelToFg', () => {
  it('uses dark text for high levels and light text for low levels', () => {
    expect(levelToFg(0)).toBe('#f1f5f9');
    expect(levelToFg(2)).toBe('#f1f5f9');
    expect(levelToFg(3)).toBe('#04221f');
    expect(levelToFg(4)).toBe('#04221f');
  });
});
