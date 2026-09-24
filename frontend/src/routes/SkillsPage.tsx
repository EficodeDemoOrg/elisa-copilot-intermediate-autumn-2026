import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { COMPETENCY_LEVELS, type CompetencyLevel, type Skill } from '@tsm/shared';

export function SkillsPage(): JSX.Element {
  const qc = useQueryClient();
  const skills = useQuery({ queryKey: ['skills'], queryFn: api.listSkills });
  const [filter, setFilter] = useState('');
  const [draft, setDraft] = useState<Omit<Skill, 'id'>>({
    name: '',
    category: '',
    description: '',
    targetLevel: 3 as CompetencyLevel,
  });

  const create = useMutation({
    mutationFn: api.createSkill,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills'] });
      setDraft({ name: '', category: '', description: '', targetLevel: 3 as CompetencyLevel });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Skill, 'id'>> }) => api.updateSkill(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });

  const del = useMutation({
    mutationFn: api.deleteSkill,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  });

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return skills.data ?? [];
    return (skills.data ?? []).filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
    );
  }, [skills.data, filter]);

  return (
    <div>
      <h1>Skills Inventory</h1>
      <p className="subtitle">All tracked skills, their categories, and the team-wide target proficiency.</p>

      <h2>Add skill</h2>
      <div className="card" style={{ marginBottom: 24 }}>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.name || !draft.category) return;
            create.mutate(draft);
          }}
        >
          <input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          <input placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} required />
          <input placeholder="Description (optional)" value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={{ minWidth: 240 }} />
          <select value={draft.targetLevel} onChange={(e) => setDraft({ ...draft, targetLevel: Number(e.target.value) as CompetencyLevel })}>
            {COMPETENCY_LEVELS.map((l) => <option key={l} value={l}>Target {l}</option>)}
          </select>
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="card stack">
        <div className="toolbar">
          <input
            placeholder="Filter by name or category…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ minWidth: 260 }}
          />
          <span className="spacer" />
          <span className="muted">{filtered.length} of {skills.data?.length ?? 0}</span>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Target</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  {s.description ? <div className="muted" style={{ fontSize: 12 }}>{s.description}</div> : null}
                </td>
                <td><span className="badge">{s.category}</span></td>
                <td>
                  <select
                    value={s.targetLevel}
                    onChange={(e) =>
                      update.mutate({ id: s.id, patch: { targetLevel: Number(e.target.value) as CompetencyLevel } })
                    }
                  >
                    {COMPETENCY_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="secondary" onClick={() => del.mutate(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
