'use client';

import { useState } from 'react';
import { Alert, Field, LanguagePair, LanguagePairFields } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const thisYear = new Date().getFullYear();
const EMPTY = { name: '', birthYear: '', languages: { primary: 'en', secondary: 'es' } };

export default function ChildrenPanel() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refresh();
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const addChild = async (e) => {
    e.preventDefault();
    const ok = await run(() =>
      api('/users/me/children', {
        method: 'POST',
        body: {
          name: form.name,
          birthYear: form.birthYear ? Number(form.birthYear) : undefined,
          primaryLanguage: form.languages.primary,
          secondaryLanguage: form.languages.secondary,
        },
      }),
    );
    if (ok) {
      setForm(EMPTY);
      setAdding(false);
    }
  };

  const removeChild = (child) => {
    if (window.confirm(`Remove ${child.name}’s profile?`)) {
      run(() => api(`/users/me/children/${child._id}`, { method: 'DELETE' }));
    }
  };

  return (
    <section className="card stack" aria-labelledby="kids-heading">
      <div className="row between wrap gap">
        <h2 id="kids-heading">Little readers</h2>
        {!adding && (
          <button className="btn btn-outline btn-sm" onClick={() => setAdding(true)}>
            + Add a child
          </button>
        )}
      </div>
      <Alert error={error} />

      {user.children.length === 0 && !adding && (
        <p className="muted">Add your children so we can match books to their age and languages.</p>
      )}

      <ul className="kid-list">
        {user.children.map((c) => (
          <li key={c._id} className="kid">
            <span className="kid-avatar" aria-hidden="true">
              {c.name[0]?.toUpperCase()}
            </span>
            <div>
              <strong>{c.name}</strong>
              <div className="muted small">
                {c.birthYear ? `Age ${thisYear - c.birthYear} · ` : ''}
                <LanguagePair languages={{ primary: c.primaryLanguage, secondary: c.secondaryLanguage }} />
              </div>
            </div>
            <button className="btn btn-ghost btn-sm danger" onClick={() => removeChild(c)} disabled={busy}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {adding && (
        <form className="stack edit-panel" onSubmit={addChild}>
          <div className="form-grid">
            <Field label="Name">
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={50}
                required
              />
            </Field>
            <Field label="Birth year (optional)">
              <select
                className="input"
                value={form.birthYear}
                onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
              >
                <option value="">Prefer not to say</option>
                {Array.from({ length: 13 }, (_, i) => thisYear - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <LanguagePairFields
            value={form.languages}
            onChange={(languages) => setForm({ ...form, languages })}
          />
          <div className="row gap">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
