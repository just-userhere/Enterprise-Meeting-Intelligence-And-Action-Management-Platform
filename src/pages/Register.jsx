import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../services/api.js';
import { ErrorBanner, Field, PrimaryButton, inputCls } from '../components/UI.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ ...form, email: form.email.trim(), name: form.name.trim() });
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err, 'Registration failed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xl font-bold text-slate-900">Create your account</p>
        <p className="mt-1 text-sm text-slate-500">Join your team's MeetingMind workspace.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <ErrorBanner message={error} />
          <Field label="Full name">
            <input className={inputCls} required minLength={2} value={form.name} onChange={set('name')} placeholder="Ada Lovelace" />
          </Field>
          <Field label="Work email">
            <input className={inputCls} required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />
          </Field>
          <Field label="Password (min 8 characters)">
            <input className={inputCls} required minLength={8} type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
          </Field>
          <Field label="Role">
            <select className={inputCls} value={form.role} onChange={set('role')}>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </Field>
          <PrimaryButton type="submit" disabled={busy} className="w-full">
            {busy ? 'Creating…' : 'Create account'}
          </PrimaryButton>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
