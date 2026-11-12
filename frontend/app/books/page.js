'use client';

import { useEffect, useState } from 'react';
import BookCard from '@/components/BookCard';
import { Alert, EmptyState, Field, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { LANGUAGE_OPTIONS } from '@/lib/languages';

export default function BooksPage() {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [lang, setLang] = useState('');
  const [age, setAge] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, error, loading } = useApi('/books', { query: { q, lang, age, page, limit: 12 } });

  return (
    <div className="container section">
      <h1>The library</h1>
      <p className="lead muted">Every title is printed in two languages and comes with read-along narration.</p>

      <form className="filters" onSubmit={(e) => e.preventDefault()} role="search">
        <Field label="Search">
          <input
            className="input"
            type="search"
            placeholder="Title or author"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Field>
        <Field label="Language">
          <select
            className="input"
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any language</option>
            {LANGUAGE_OPTIONS.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Child’s age">
          <select
            className="input"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any age</option>
            {Array.from({ length: 11 }, (_, i) => i + 1).map((a) => (
              <option key={a} value={a}>
                {a} {a === 1 ? 'year' : 'years'}
              </option>
            ))}
          </select>
        </Field>
      </form>

      {error && <Alert error={error} />}
      {loading && !data && <Spinner />}
      {data && (
        <>
          {data.items.length === 0 ? (
            <EmptyState title="No books match those filters">
              <p className="muted">Try another language or age.</p>
            </EmptyState>
          ) : (
            <div className="grid grid-books" aria-busy={loading}>
              {data.items.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
          {data.pages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                ← Prev
              </button>
              <span className="muted">
                Page {data.page} of {data.pages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= data.pages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
