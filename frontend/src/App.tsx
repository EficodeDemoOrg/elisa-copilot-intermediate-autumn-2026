import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar.js';
import { SkillsPage } from './routes/SkillsPage.js';
import { EngineersPage } from './routes/EngineersPage.js';
import { EngineerDetailPage } from './routes/EngineerDetailPage.js';
import { TeamHeatmapPage } from './routes/TeamHeatmapPage.js';
import { TeamGapsPage } from './routes/TeamGapsPage.js';
import { RecommendationsPage } from './routes/RecommendationsPage.js';
import { HomePage } from './routes/HomePage.js';

export default function App(): JSX.Element {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/engineers" element={<EngineersPage />} />
          <Route path="/engineers/:id" element={<EngineerDetailPage />} />
          <Route path="/engineers/:id/recommendations" element={<RecommendationsPage />} />
          <Route path="/teams/:teamId/heatmap" element={<TeamHeatmapPage />} />
          <Route path="/teams/:teamId/gaps" element={<TeamGapsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
