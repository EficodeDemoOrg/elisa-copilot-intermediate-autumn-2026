import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { createDb, type DB } from './db.js';
import { skillsRouter } from './routes/skills.js';
import { engineersRouter } from './routes/engineers.js';
import { teamsRouter } from './routes/teams.js';
import { assessmentsRouter } from './routes/assessments.js';
import { analyticsRouter } from './routes/analytics.js';
import { recommendationsRouter } from './routes/recommendations.js';

export function createApp(db: DB): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/skills', skillsRouter(db));
  app.use('/api/engineers', engineersRouter(db));
  app.use('/api/teams', teamsRouter(db));
  app.use('/api/assessments', assessmentsRouter(db));
  app.use('/api/analytics', analyticsRouter(db));
  app.use('/api/recommendations', recommendationsRouter(db));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}

const PORT = Number(process.env.PORT ?? 47821);

async function main(): Promise<void> {
  const db = await createDb();
  const app = createApp(db);
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${PORT}`);
  });
}

// Only auto-start when this file is executed directly, not when imported by tests.
const isEntrypoint =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('server.ts') ||
  process.argv[1]?.endsWith('server.js');

if (isEntrypoint) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
