import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Target, Trash2, Calendar, Pencil } from 'lucide-react';
import { goalsApi, habitsApi } from '../api';
import { Goal } from '../types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

type GF = { title: string; description: string; startDate: string; endDate: string; habitIds: string[] };
const blank = (): GF => ({ title: '', description: '', startDate: '', endDate: '', habitIds: [] });

function GoalModal({ goal, habits, onClose }: { goal: Goal | null; habits: any[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<GF>(goal ? { title: goal.title, description: goal.description || '', startDate: goal.startDate, endDate: goal.endDate, habitIds: (goal.habitIds as any[]).map((h: any) => typeof h === 'string' ? h : h._id) } : blank());

  const save = useMutation({
    mutationFn: () => goal ? goalsApi.update(goal._id, f) : goalsApi.create(f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); toast.success(goal ? 'Updated!' : 'Goal created!'); onClose(); },
    onError: () => toast.error('Failed to save'),
  });

  const lbl = (t: string) => <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 6 }}>{t}</div>;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }}>
      <div className="card anim-pop" style={{ width: '100%', maxWidth: 440, borderRadius: 20, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>{goal ? 'Edit Goal' : 'New Goal'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>{lbl('Title *')}<input value={f.title} onChange={e => setF(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Run a 5K" className="input-base" /></div>
          <div>{lbl('Description')}<input value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} placeholder="Optional" className="input-base" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>{lbl('Start Date')}<input type="date" value={f.startDate} onChange={e => setF(p => ({ ...p, startDate: e.target.value }))} className="input-base" /></div>
            <div>{lbl('End Date')}<input type="date" value={f.endDate} onChange={e => setF(p => ({ ...p, endDate: e.target.value }))} className="input-base" /></div>
          </div>
          {habits.length > 0 && (
            <div>
              {lbl('Link Habits')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                {habits.map(h => (
                  <label key={h._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={f.habitIds.includes(h._id)} onChange={() => setF(p => ({ ...p, habitIds: p.habitIds.includes(h._id) ? p.habitIds.filter(x => x !== h._id) : [...p.habitIds, h._id] }))} style={{ accentColor: '#6366F1' }} />
                    <span style={{ fontSize: 14 }}>{h.icon}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{h.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button onClick={() => { if (!f.title || !f.startDate || !f.endDate) { toast.error('Fill required fields'); return; } save.mutate(); }} disabled={save.isPending} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {goal ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<Goal | 'new' | null>(null);
  const { data: goals = [], isLoading } = useQuery({ queryKey: ['goals'], queryFn: goalsApi.getAll });
  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: habitsApi.getAll });

  const del = useMutation({
    mutationFn: goalsApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); toast.success('Deleted'); },
  });

  return (
    <div className="anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div><h1 className="page-title">Goals</h1><p className="page-sub">{goals.length} goal{goals.length !== 1 ? 's' : ''}</p></div>
        <button onClick={() => setModal('new')} className="btn-primary"><Plus size={16} />Add Goal</button>
      </div>

      {goals.length === 0 && !isLoading ? (
        <div className="card" style={{ padding: 64, textAlign: 'center', borderRadius: 20 }}>
          <Target size={44} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>No goals yet</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 20 }}>Set goals and link habits to track progress</p>
          <button onClick={() => setModal('new')} className="btn-primary" style={{ margin: '0 auto' }}><Plus size={16} />Create first goal</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {goals.map(g => {
            const left = differenceInDays(parseISO(g.endDate), new Date());
            const ended = left < 0;
            return (
              <div key={g._id} className="card" style={{ padding: 18, borderRadius: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{g.title}</div>
                    {g.description && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{g.description}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{g.progress}%</span>
                    <button onClick={() => setModal(g)} style={{ padding: 6, borderRadius: 7, border: 'none', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><Pencil size={13} /></button>
                    <button onClick={() => { if (confirm('Delete?')) del.mutate(g._id); }} style={{ padding: 6, borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.07)', color: '#F87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ height: '100%', width: `${g.progress}%`, background: '#5558E3', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 11 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.35)' }}>
                    <Calendar size={11} />
                    {format(parseISO(g.startDate), 'MMM d')} → {format(parseISO(g.endDate), 'MMM d, yyyy')}
                  </span>
                  <span style={{ color: ended ? '#F87171' : left <= 7 ? '#F59E0B' : 'rgba(255,255,255,0.38)', fontWeight: 600 }}>
                    {ended ? 'Ended' : `${left}d left`}
                  </span>
                  {(g.habitIds as any[]).length > 0 && (
                    <span style={{ background: 'rgba(99,102,241,0.15)', color: '#A5B4FC', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                      {(g.habitIds as any[]).length} habit{(g.habitIds as any[]).length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modal !== null && <GoalModal goal={modal === 'new' ? null : modal} habits={habits} onClose={() => setModal(null)} />}
    </div>
  );
}
