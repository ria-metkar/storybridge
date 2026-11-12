'use client';

import { useState } from 'react';
import { Alert, Field, LanguagePairFields } from '@/components/ui';
import { api } from '@/lib/api';

const PAGES_EXAMPLE = [
  {
    number: 1,
    illustration: '🌙',
    audioUrl: '',
    lines: [
      { lang: 'en', text: 'Every night, the moon visits the old mango tree.' },
      { lang: 'es', text: 'Cada noche, la luna visita el viejo árbol de mango.' },
    ],
  },
];

const fromBook = (b) => ({
  slug: b?.slug ?? '',
  titlePrimary: b?.title.primary ?? '',
  titleSecondary: b?.title.secondary ?? '',
  languages: b?.languages ?? { primary: 'en', secondary: 'es' },
  author: b?.author ?? '',
  illustrator: b?.illustrator ?? '',
  narrator: b?.narrator ?? '',
  summary: b?.summary ?? '',
  ageMin: b?.ageMin ?? 2,
  ageMax: b?.ageMax ?? 6,
  coverColor: b?.coverColor ?? '#f4a261',
  coverEmoji: b?.coverEmoji ?? '📖',
  audioCode: b?.audioCode ?? '',
  isSample: b?.isSample ?? false,
  published: b?.published ?? true,
  pagesJson: JSON.stringify(b?.pages ?? PAGES_EXAMPLE, null, 2),
});

const optional = (v) => (v?.trim() ? v.trim() : undefined);

export default function BookEditor({ book, onCancel, onSaved }) {
  const [form, setForm] = useState(() => fromBook(book));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let pages;
    try {
      pages = JSON.parse(form.pagesJson);
      if (!Array.isArray(pages)) throw new Error();
    } catch {
      setError(new Error('Pages must be a valid JSON array (see the example format).'));
      return;
    }

    const body = {
      slug: form.slug.trim(),
      title: { primary: form.titlePrimary.trim(), secondary: form.titleSecondary.trim() },
      languages: form.languages,
      author: form.author.trim(),
      illustrator: optional(form.illustrator),
      narrator: optional(form.narrator),
      summary: optional(form.summary),
      ageMin: Number(form.ageMin),
      ageMax: Number(form.ageMax),
      coverColor: form.coverColor,
      coverEmoji: optional(form.coverEmoji),
      audioCode: form.audioCode.trim(),
      isSample: form.isSample,
      published: form.published,
      pages,
    };

    setSaving(true);
    try {
      await api(book ? `/admin/books/${book._id}` : '/admin/books', { method: book ? 'PUT' : 'POST', body });
      onSaved();
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  };

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <div className="row between wrap gap">
        <h2>{book ? `Edit “${book.title.primary}”` : 'New book'}</h2>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          ← Back to list
        </button>
      </div>

      <div className="form-grid">
        <Field label="Title (first language)">
          <input className="input" value={form.titlePrimary} onChange={set('titlePrimary')} required />
        </Field>
        <Field label="Title (second language)">
          <input className="input" value={form.titleSecondary} onChange={set('titleSecondary')} required />
        </Field>
      </div>
      <LanguagePairFields
        value={form.languages}
        onChange={(languages) => setForm({ ...form, languages })}
        labels={['First language', 'Second language']}
      />
      <div className="form-grid">
        <Field label="URL slug" hint="e.g. the-moon-and-the-mango-tree">
          <input className="input" value={form.slug} onChange={set('slug')} required />
        </Field>
        <Field label="Audio code" hint="Printed inside the book. Letters, numbers, dashes.">
          <input className="input input-code" value={form.audioCode} onChange={set('audioCode')} required />
        </Field>
        <Field label="Author">
          <input className="input" value={form.author} onChange={set('author')} required />
        </Field>
        <Field label="Illustrator">
          <input className="input" value={form.illustrator} onChange={set('illustrator')} />
        </Field>
        <Field label="Narrator">
          <input className="input" value={form.narrator} onChange={set('narrator')} />
        </Field>
        <div className="row gap">
          <Field label="Min age">
            <input className="input" type="number" min={0} max={12} value={form.ageMin} onChange={set('ageMin')} />
          </Field>
          <Field label="Max age">
            <input className="input" type="number" min={0} max={12} value={form.ageMax} onChange={set('ageMax')} />
          </Field>
        </div>
        <div className="row gap">
          <Field label="Cover colour">
            <input className="input input-color" type="color" value={form.coverColor} onChange={set('coverColor')} />
          </Field>
          <Field label="Cover emoji">
            <input className="input" value={form.coverEmoji} onChange={set('coverEmoji')} maxLength={16} />
          </Field>
        </div>
        <div className="stack-sm">
          <label className="row gap-sm">
            <input type="checkbox" checked={form.published} onChange={set('published')} /> Published
          </label>
          <label className="row gap-sm">
            <input type="checkbox" checked={form.isSample} onChange={set('isSample')} /> Free sample (code shown publicly)
          </label>
        </div>
      </div>
      <Field label="Summary">
        <textarea className="input" rows={3} value={form.summary} onChange={set('summary')} maxLength={2000} />
      </Field>
      <Field
        label="Pages (JSON)"
        hint="Each page: number, illustration (emoji or image URL), optional audioUrl, and lines [{ lang, text, start?, end? }]. start/end are seconds into that page’s audio and drive highlighting; without audioUrl the player uses device speech."
      >
        <textarea
          className="input input-mono"
          rows={16}
          value={form.pagesJson}
          onChange={set('pagesJson')}
          spellCheck={false}
        />
      </Field>
      <Alert error={error} />
      <div className="row gap">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : book ? 'Save changes' : 'Create book'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
