import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

export function Sidebar(): JSX.Element {
  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: api.listTeams });
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="brand">
        <span className="dot" />
        SkillsMatrix
      </div>
      <div className="nav-section">Catalog</div>
      <NavLink to="/skills" className={({ isActive }) => (isActive ? 'active' : undefined)}>
        Skills
      </NavLink>
      <NavLink to="/engineers" className={({ isActive }) => (isActive ? 'active' : undefined)}>
        Engineers
      </NavLink>

      <div className="nav-section">Teams</div>
      {teams?.map((t) => (
        <NavLink
          key={t.id}
          to={`/teams/${t.id}/heatmap`}
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          {t.name}
        </NavLink>
      ))}
    </nav>
  );
}
