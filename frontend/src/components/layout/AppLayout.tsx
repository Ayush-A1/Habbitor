import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, ListChecks, Target,
  BarChart2, StickyNote, Settings, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../store/auth';
import { authApi } from '../../api';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits',    icon: ListChecks,      label: 'Habits'    },
  { to: '/goals',     icon: Target,          label: 'Goals'     },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics' },
  { to: '/notes',     icon: StickyNote,      label: 'Notes'     },
  { to: '/settings',  icon: Settings,        label: 'Settings'  },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } finally {
      logout();
      navigate('/login');
      toast.success('Signed out');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#08080F', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.6)' }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 210,
          flexShrink: 0,
          background: '#060609',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed' as const,
          top: 0, bottom: 0, left: 0,
          zIndex: 30,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease',
        }}
        className="lg-sidebar"
      >
        <style>{`
          @media (min-width: 1024px) {
            .lg-sidebar { transform: translateX(0) !important; position: static !important; }
            .lg-main { margin-left: 0 !important; }
          }
        `}</style>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 32, height: 32, background: '#5558E3', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🔥</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>HabitFlow</span>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn('nav-item', isActive && 'active')}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#5558E3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item" style={{ color: 'rgba(255,255,255,0.35)', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }}>
            <LogOut size={15} style={{ flexShrink: 0 }} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: 0 }}>
        {/* Mobile top bar */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#060609', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }} className="mobile-header">
          <style>{`@media (min-width: 1024px) { .mobile-header { display: none !important; } }`}</style>
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: '#5558E3', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🔥</div>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>HabitFlow</span>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Desktop sidebar spacer */}
      <style>{`@media (min-width: 1024px) { .lg-main { margin-left: 210px; } }`}</style>
    </div>
  );
}
