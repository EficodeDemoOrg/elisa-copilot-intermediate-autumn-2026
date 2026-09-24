import { test, expect } from '@playwright/test';

test('home page renders and team heatmap loads with seeded data', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Team Skills Matrix' })).toBeVisible();

  // Click Platform team link in the sidebar.
  await page.getByRole('link', { name: 'Platform' }).first().click();
  await expect(page.getByRole('heading', { name: /Platform.*Heatmap/i })).toBeVisible();

  // Heatmap grid renders cells.
  await expect(page.getByRole('grid', { name: /heatmap/i })).toBeVisible();
  // At least one cell should be present.
  await expect(page.locator('[data-testid^="cell-"]')).not.toHaveCount(0);
});
