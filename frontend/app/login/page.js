'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Alert, Field, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { safeNext } from '@/lib/api';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(form.email, form.password);
      router.push(user.role === 'admin' && next === '/account' ? '/admin' : next);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="container section narrow">
      <h1>Welcome back</h1>
      <form className="card stack" onSubmit={onSubmit} noValidate>
        <Alert error={error} />
        <Field label="Email">
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Field>
        <Field label="Password">
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Field>
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="muted">
        New here? <Link href={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LoginForm />
    </Suspense>
  );
}
