import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuth } from '../store/auth';
import { AuthShell, Field, Err } from './LoginPage';
import toast from 'react-hot-toast';

type F = { name: string; email: string; password: string; confirm: string };

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<F>();
  const pw = watch('password');

  const { mutate, isPending } = useMutation({
    mutationFn: ({ name, email, password }: F) => authApi.register({ name, email, password }),
    onSuccess: (data) => { setAuth(data.user, data.accessToken, data.refreshToken); toast.success('Account created! 🎉'); navigate('/dashboard'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Registration failed'),
  });

  return (
    <AuthShell title="Create account" sub="Start building better habits today">
      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Full Name">
          <input {...register('name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} placeholder="Ayush Sharma" className="input-base" />
          {errors.name && <Err>{errors.name.message}</Err>}
        </Field>
        <Field label="Email">
          <input {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" placeholder="you@example.com" className="input-base" />
          {errors.email && <Err>{errors.email.message}</Err>}
        </Field>
        <Field label="Password">
          <input {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" placeholder="••••••••" className="input-base" />
          {errors.password && <Err>{errors.password.message}</Err>}
        </Field>
        <Field label="Confirm Password">
          <input {...register('confirm', { required: 'Required', validate: (v) => v === pw || "Passwords don't match" })} type="password" placeholder="••••••••" className="input-base" />
          {errors.confirm && <Err>{errors.confirm.message}</Err>}
        </Field>
        <button type="submit" disabled={isPending} className="btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.38)', marginTop: 20 }}>
        Already have one?{' '}
        <Link to="/login" style={{ color: '#A5B4FC', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </AuthShell>
  );
}
