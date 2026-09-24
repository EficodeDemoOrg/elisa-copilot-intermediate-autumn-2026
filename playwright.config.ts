import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const E2E_DB = path.resolve(__dirname, 'backend/data/db.e2e.json');

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npx tsx src/scripts/reset-db.ts && npx tsx src/server.ts',
      cwd: path.resolve(__dirname, 'backend'),
      url: 'http://localhost:4001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { TSM_DB_PATH: E2E_DB, PORT: '4001' },
    },
    {
      command: 'npm run build && npm run preview -- --port 4173 --strictPort',
      cwd: path.resolve(__dirname, 'frontend'),
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: { VITE_API_URL: 'http://localhost:4001' },
    },
  ],
});
