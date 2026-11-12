'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Alert, Field, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { safeNext } from '@/lib/api';

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'), '/plans');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(form);
      router.push(next);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="container section narrow">
      <h1>Create your account</h1>
      <form className="card stack" onSubmit={onSubmit} noValidate>
        <Alert error={error} />
        <Field label="Your name">
          <input className="input" autoComplete="name" value={form.name} onChange={set('name')} required />
        </Field>
        <Field label="Email">
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            required
          />
        </Field>
        <Field label="Password" hint="At least 8 characters, including a letter and a number.">
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            minLength={8}
            required
          />
        </Field>
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="muted">
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <RegisterForm />
    </Suspense>
  );
}
