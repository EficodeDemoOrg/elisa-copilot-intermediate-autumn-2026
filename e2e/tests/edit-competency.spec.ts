import { test, expect } from '@playwright/test';

test('editing a heatmap cell persists across reload', async ({ page, request }) => {
  // Reset known engineer/skill via API directly to a known starting level.
  await request.put('http://localhost:4001/api/assessments/eng_p3/skl_test', {
    data: { level: 0 },
  });

  await page.goto('/teams/team_platform/heatmap');
  const cell = page.getByTestId('cell-eng_p3-skl_test');
  await expect(cell).toBeVisible();
  await expect(cell).toHaveText('0');

  // Click cycles 0 -> 1.
  await cell.click();
  await expect(cell).toHaveText('1');

  // Reload and verify it stuck.
  await page.reload();
  await expect(page.getByTestId('cell-eng_p3-skl_test')).toHaveText('1');
});
