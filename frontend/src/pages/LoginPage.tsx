import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuth } from '../store/auth';
import toast from 'react-hot-toast';

type F = { email: string; password: string };

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<F>();

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => { setAuth(data.user, data.accessToken, data.refreshToken); toast.success('Welcome back!'); navigate('/dashboard'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Login failed'),
  });

  return (
    <AuthShell title="Welcome back" sub="Sign in to your account">
      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email">
          <input {...register('email', { required: 'Required' })} type="email" placeholder="you@example.com" className="input-base" />
          {errors.email && <Err>{errors.email.message}</Err>}
        </Field>
        <Field label="Password">
          <input {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" placeholder="••••••••" className="input-base" />
          {errors.password && <Err>{errors.password.message}</Err>}
        </Field>
        <button type="submit" disabled={isPending} className="btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.38)', marginTop: 20 }}>
        No account?{' '}
        <Link to="/register" style={{ color: '#A5B4FC', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
      </p>
    </AuthShell>
  );
}

// ── Shared sub-components ───────────────────────────────────────────────────
export function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#08080F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }} className="anim-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, background: '#5558E3', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔥</div>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>HabitFlow</span>
        </div>
        <div className="card" style={{ padding: 28, borderRadius: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{title}</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 24 }}>{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
      {children}
    </div>
  );
}

export function Err({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 11, color: '#F87171', marginTop: 2 }}>{children}</span>;
}
