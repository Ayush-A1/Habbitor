import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../store/auth';
import { authApi } from '../api';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{ width: 40, height: 22, borderRadius: 20, background: on ? '#5558E3' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: 3, left: on ? 'calc(100% - 19px)' : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
    </button>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Icon size={15} style={{ color: '#A5B4FC' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: authApi.me });
  const [name, setName] = useState(user?.name ?? '');
  const [notifs, setNotifs] = useState({ daily: true, streak: true, weekly: false });

  const handleLogout = async () => {
    try { await authApi.logout(); } finally { logout(); navigate('/login'); toast.success('Signed out'); }
  };

  const lbl = (t: string) => (
    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 6 }}>{t}</div>
  );

  return (
    <div className="anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500 }}>
      <div><h1 className="page-title">Settings</h1><p className="page-sub">Account and preferences</p></div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#5558E3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {(me?.name ?? user?.name ?? 'A')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{me?.name ?? user?.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
              Member since {me?.createdAt ? format(parseISO(me.createdAt), 'MMMM yyyy') : '—'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            {lbl('Full Name')}
            <input value={name} onChange={e => setName(e.target.value)} className="input-base" />
          </div>
          <div>
            {lbl('Email')}
            <input value={me?.email ?? user?.email ?? ''} disabled className="input-base" style={{ opacity: 0.4, cursor: 'not-allowed' }} />
          </div>
          <button onClick={() => toast.success('Profile saved!')} className="btn-primary" style={{ width: 'fit-content' }}>
            Save Changes
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { key: 'daily',  label: 'Daily reminder',  desc: 'Remind you to check in each day' },
            { key: 'streak', label: 'Streak alerts',   desc: 'Alert when your streak is at risk' },
            { key: 'weekly', label: 'Weekly summary',  desc: 'Email recap every Sunday' },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{desc}</div>
              </div>
              <Toggle on={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section icon={Shield} title="Security">
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
          Passwords are hashed with bcrypt. JWT tokens expire after 15 minutes.
        </p>
        <button onClick={() => toast('Password reset coming soon!', { icon: '🔒' })} className="btn-ghost" style={{ fontSize: 13 }}>
          Change Password
        </button>
      </Section>

      {/* Account */}
      <Section icon={LogOut} title="Account">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={handleLogout} className="btn-ghost">
            <LogOut size={15} /> Sign out
          </button>
          <button
            onClick={() => { if (confirm('Delete your account? This cannot be undone.')) toast.error('Account deletion coming soon'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)', color: '#F87171', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Delete Account
          </button>
        </div>
      </Section>
    </div>
  );
}
