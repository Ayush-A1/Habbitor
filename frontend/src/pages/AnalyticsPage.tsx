import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../api';

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a28', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '8px 12px' }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#A5B4FC' }}>{payload[0].value}{payload[0].name === 'rate' ? '%' : ''}</p>
    </div>
  );
};

const HEAT = ['#151520', '#2D2B78', '#4338CA', '#6366F1', '#A5B4FC'];

export default function AnalyticsPage() {
  const { data: ov }       = useQuery({ queryKey: ['analytics', 'overview'], queryFn: analyticsApi.overview });
  const { data: trends = [] } = useQuery({ queryKey: ['analytics', 'trends'],   queryFn: () => analyticsApi.trends(30) });
  const { data: weekly = [] } = useQuery({ queryKey: ['analytics', 'weekly'],   queryFn: analyticsApi.weekly });
  const { data: heatmap = [] } = useQuery({ queryKey: ['analytics', 'heatmap'], queryFn: () => analyticsApi.heatmap(84) });

  const stats = [
    { label: 'Total Habits', value: ov?.totalHabits ?? 0 },
    { label: 'Completion Rate', value: `${ov?.completionRate ?? 0}%` },
    { label: 'Best Streak', value: `${ov?.bestStreak ?? 0}d` },
    { label: 'Active Streaks', value: ov?.activeStreaks ?? 0 },
  ];

  return (
    <div className="anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><h1 className="page-title">Analytics</h1><p className="page-sub">Last 30 days</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="card" style={{ padding: 18, borderRadius: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>30-Day Completion Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trends} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} interval={5} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<TT />} />
            <Line type="monotone" dataKey="rate" name="rate" stroke="#6366F1" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Weekly */}
        <div className="card" style={{ padding: 18, borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>This Week</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={weekly} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} />
              <Tooltip content={<TT />} />
              <Bar dataKey="completed" fill="#6366F1" fillOpacity={0.75} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="card" style={{ padding: 18, borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>12-Week Heatmap</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 12 }).map((_, w) => (
              <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {Array.from({ length: 7 }).map((_, d) => {
                  const e = heatmap[w * 7 + d];
                  return <div key={d} title={e?.date} style={{ width: 12, height: 12, borderRadius: 3, background: e ? HEAT[e.level] : '#151520' }} />;
                })}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 10 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginRight: 2 }}>Less</span>
            {HEAT.map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />)}
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginLeft: 2 }}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
