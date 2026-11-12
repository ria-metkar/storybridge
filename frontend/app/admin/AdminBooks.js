'use client';

import Link from 'next/link';
import { useState } from 'react';
import BookEditor from './BookEditor';
import { Alert, LanguagePair, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';

export default function AdminBooks() {
  const { data, error, loading, reload } = useApi('/admin/books');
  const [editing, setEditing] = useState(null); // null | 'new' | book
  const [loadError, setLoadError] = useState(null);

  const openEditor = async (id) => {
    setLoadError(null);
    try {
      const { book } = await api(`/admin/books/${id}`);
      setEditing(book);
    } catch (err) {
      setLoadError(err);
    }
  };

  const remove = async (book) => {
    if (!window.confirm(`Delete “${book.title.primary}”? This cannot be undone.`)) return;
    try {
      await api(`/admin/books/${book._id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      setLoadError(err);
    }
  };

  if (editing) {
    return (
      <BookEditor
        book={editing === 'new' ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
    );
  }

  return (
    <div className="stack">
      <div className="row between wrap gap">
        <p className="muted">{data ? `${data.items.length} books` : ''}</p>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          + New book
        </button>
      </div>
      {loading && <Spinner />}
      <Alert error={error || loadError} />
      {data && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Languages</th>
                <th>Ages</th>
                <th>Audio code</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((b) => (
                <tr key={b._id}>
                  <td>
                    <span aria-hidden="true">{b.coverEmoji}</span> {b.title.primary}
                    <div className="muted small">{b.title.secondary}</div>
                  </td>
                  <td>
                    <LanguagePair languages={b.languages} />
                  </td>
                  <td>
                    {b.ageMin}–{b.ageMax}
                  </td>
                  <td>
                    <Link href={`/listen/${b.audioCode}`}>
                      <code>{b.audioCode}</code>
                    </Link>
                  </td>
                  <td className="small">
                    {b.published ? 'Published' : 'Draft'}
                    {b.isSample && ' · Sample'}
                  </td>
                  <td className="row gap-sm">
                    <button className="btn btn-outline btn-sm" onClick={() => openEditor(b._id)}>
                      Edit
                    </button>
                    <button className="btn btn-ghost btn-sm danger" onClick={() => remove(b)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
