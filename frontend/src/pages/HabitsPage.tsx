import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Flame, ListChecks } from 'lucide-react';
import { habitsApi } from '../api';
import { Habit } from '../types';
import { COLORS, ICONS, cn } from '../lib/utils';
import toast from 'react-hot-toast';

const BLANK = { name: '', description: '', frequency: 'daily', color: '#6366F1', icon: '⭐', reminderTime: '' };

function HabitModal({ habit, onClose }: { habit: Habit | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState(habit ? { name: habit.name, description: habit.description || '', frequency: habit.frequency, color: habit.color, icon: habit.icon, reminderTime: habit.reminderTime || '' } : { ...BLANK });

  const save = useMutation({
    mutationFn: () => habit ? habitsApi.update(habit._id, f) : habitsApi.create(f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); toast.success(habit ? 'Updated!' : 'Habit created!'); onClose(); },
    onError: () => toast.error('Failed to save'),
  });

  const lbl = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 6 }}>{t}</div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }}>
      <div className="card anim-pop" style={{ width: '100%', maxWidth: 440, borderRadius: 20, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>{habit ? 'Edit Habit' : 'New Habit'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>{lbl('Name *')}<input value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Morning Run" className="input-base" /></div>
          <div>{lbl('Description')}<input value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} placeholder="Optional" className="input-base" /></div>

          <div>
            {lbl('Frequency')}
            <select value={f.frequency} onChange={e => setF(p => ({ ...p, frequency: e.target.value }))} className="input-base">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            {lbl('Icon')}
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setF(p => ({ ...p, icon: ic }))}
                  style={{ width: 36, height: 36, borderRadius: 10, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', background: f.icon === ic ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)', outline: f.icon === ic ? '1px solid #6366F1' : 'none', transition: 'all 0.1s' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            {lbl('Color')}
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setF(p => ({ ...p, color: c }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: 'none', outline: f.color === c ? '2px solid white' : 'none', outlineOffset: 2, transition: 'all 0.1s' }} />
              ))}
            </div>
          </div>

          <div>{lbl('Reminder Time')}<input type="time" value={f.reminderTime} onChange={e => setF(p => ({ ...p, reminderTime: e.target.value }))} className="input-base" /></div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button onClick={() => { if (!f.name.trim()) { toast.error('Name required'); return; } save.mutate(); }} disabled={save.isPending} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {habit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<Habit | 'new' | null>(null);
  const { data: habits = [], isLoading } = useQuery({ queryKey: ['habits'], queryFn: habitsApi.getAll });

  const del = useMutation({
    mutationFn: habitsApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); toast.success('Deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div className="anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div><h1 className="page-title">Habits</h1><p className="page-sub">{habits.length} active habit{habits.length !== 1 ? 's' : ''}</p></div>
        <button onClick={() => setModal('new')} className="btn-primary"><Plus size={16} />Add Habit</button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ height: 76, background: 'rgba(255,255,255,0.03)', borderRadius: 14, animation: 'fadeUp 1s ease infinite' }} />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center', borderRadius: 20 }}>
          <ListChecks size={44} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>No habits yet</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 20 }}>Build your daily routine one habit at a time</p>
          <button onClick={() => setModal('new')} className="btn-primary" style={{ margin: '0 auto' }}><Plus size={16} />Add first habit</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {habits.map(h => (
            <div key={h._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${h.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flexShrink: 0 }}>{h.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)' }}>{h.name}</div>
                {h.description && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.description}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                  <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' as const }}>{h.frequency}</span>
                  {h.currentStreak > 0 && <span style={{ fontSize: 11, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 3 }}><Flame size={11} />{h.currentStreak}d</span>}
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{h.totalCompleted} done</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ textAlign: 'center', padding: '0 8px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{h.longestStreak}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>best</div>
                </div>
                <button onClick={() => setModal(h)} style={{ padding: 7, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><Pencil size={14} /></button>
                <button onClick={() => { if (confirm(`Delete "${h.name}"?`)) del.mutate(h._id); }} style={{ padding: 7, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.07)', color: '#F87171', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && <HabitModal habit={modal === 'new' ? null : modal} onClose={() => setModal(null)} />}
    </div>
  );
}
