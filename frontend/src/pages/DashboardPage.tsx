import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Flame, TrendingUp, Zap, CheckCircle2, Target } from 'lucide-react';
import { habitsApi, logsApi, analyticsApi } from '../api';
import { today, cn } from '../lib/utils';
import { Habit, HabitLog } from '../types';
import { useAuth } from '../store/auth';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const qc = useQueryClient();
  const td = today();
  const { user } = useAuth();

  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: habitsApi.getAll });
  const { data: logs = [] } = useQuery({ queryKey: ['logs', td], queryFn: () => logsApi.forDate(td) });
  const { data: ov } = useQuery({ queryKey: ['analytics', 'overview'], queryFn: analyticsApi.overview });

  const logM = useMutation({
    mutationFn: logsApi.log,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logs', td] });
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const logMap = new Map(logs.map((l) => [l.habitId as string, l]));
  const done = logs.filter((l) => l.status === 'completed').length;
  const total = habits.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const toggle = (h: Habit) => {
    const log = logMap.get(h._id);
    const status = log?.status === 'completed' ? 'missed' : 'completed';
    logM.mutate({ habitId: h._id, date: td, status });
    if (status === 'completed') toast.success(`✅ ${h.name}`);
  };

  const stats = [
    { label: 'Completed', value: `${done}/${total}`, sub: 'Today', color: '#22C55E' },
    { label: 'Rate', value: `${ov?.completionRate ?? 0}%`, sub: 'Today', color: '#818CF8' },
    { label: 'Best Streak', value: `${ov?.bestStreak ?? 0}d`, sub: '🔥 Record', color: '#F59E0B' },
    { label: 'Active Streaks', value: ov?.activeStreaks ?? 0, sub: `of ${total} habits`, color: '#34D399' },
  ];

  return (
    <div className="anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title">Good {greet}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        {done > 0 && done === total && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 9, fontSize: 12, fontWeight: 600, color: '#22C55E' }}>
            🎉 All done today!
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 4, fontWeight: 500 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Today's Progress</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#A5B4FC' }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#5558E3', borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
          {done} of {total} habits — {['Start!','Keep going!','Halfway!','Almost!','All done! 🎉'][Math.min(done === total ? 4 : Math.floor((done / Math.max(total, 1)) * 4), 4)]}
        </p>
      </div>

      {/* Habits list */}
      <div>
        <div className="page-sub" style={{ marginBottom: 10, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)' }}>
          Habits for Today
        </div>
        {habits.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <Target size={40} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No habits yet — go add some!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {habits.map((h) => {
              const isDone = logMap.get(h._id)?.status === 'completed';
              return (
                <button
                  key={h._id}
                  onClick={() => toggle(h)}
                  disabled={logM.isPending}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
                    background: isDone ? 'rgba(34,197,94,0.05)' : '#111118',
                    border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${h.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                    {h.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isDone ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.88)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {h.name}
                    </div>
                    <div style={{ fontSize: 11, color: h.currentStreak > 0 ? '#F59E0B' : 'rgba(255,255,255,0.28)', marginTop: 2 }}>
                      {h.currentStreak > 0 ? `🔥 ${h.currentStreak} day streak` : 'No streak yet'}
                    </div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${isDone ? '#22C55E' : 'rgba(255,255,255,0.18)'}`, background: isDone ? '#22C55E' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                    {isDone && <svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" /></svg>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
