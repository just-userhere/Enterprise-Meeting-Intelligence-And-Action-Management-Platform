import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../services/api.js';
import { ErrorBanner, Field, PrimaryButton, inputCls } from '../components/UI.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err, 'Invalid email or password.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xl font-bold text-slate-900">MeetingMind</p>
        <p className="mt-1 text-sm text-slate-500">Enterprise Meeting Intelligence & Action Management</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <ErrorBanner message={error} />
          <Field label="Work email">
            <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </Field>
          <Field label="Password">
            <input className={inputCls} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          <PrimaryButton type="submit" disabled={busy} className="w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </PrimaryButton>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="font-semibold text-slate-900 underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
