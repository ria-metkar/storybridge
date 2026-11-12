'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import BookCover from '@/components/BookCover';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';
import { Alert, LanguagePair, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { ageRange } from '@/lib/format';
import { isRtl } from '@/lib/languages';

export default function BookDetailPage() {
  const { slug } = useParams();
  const { data, error, loading } = useApi(`/books/${encodeURIComponent(slug)}`);

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="container section">
        <Alert error={error} />
        <Link href="/books">← Back to the library</Link>
      </div>
    );

  const { book } = data;
  return (
    <div className="detail-wrap" style={{ '--cover': book.coverColor || '#f4a261' }}>
      <div className="container section">
        <Link href="/books" className="link-arrow small">
          <span aria-hidden="true">←</span> Back to the library
        </Link>
        <div className="detail">
          <Tilt className="detail-stage" max={22}>
            <BookCover book={book} size="lg" />
          </Tilt>
          <Reveal className="stack">
            <h1>{book.title.primary}</h1>
            <p
              className="detail-subtitle"
              lang={book.languages.secondary}
              dir={isRtl(book.languages.secondary) ? 'rtl' : undefined}
            >
              {book.title.secondary}
            </p>
            <div className="row gap-sm wrap">
              <LanguagePair languages={book.languages} />
              <span className="badge">{ageRange(book)}</span>
              <span className="badge">{book.pageCount} pages</span>
              {book.isSample && <span className="badge badge-accent">Free sample</span>}
            </div>
            {book.summary && <p className="lead">{book.summary}</p>}
            <dl className="meta">
              <dt>Written by</dt>
              <dd>{book.author}</dd>
              {book.illustrator && (
                <>
                  <dt>Illustrated by</dt>
                  <dd>{book.illustrator}</dd>
                </>
              )}
              {book.narrator && (
                <>
                  <dt>Narrated by</dt>
                  <dd>{book.narrator}</dd>
                </>
              )}
            </dl>
            {book.isSample ? (
              <div>
                <Link href={`/listen/${book.audioCode}`} className="btn btn-primary btn-lg">
                  ▶ Listen to this story free
                </Link>
              </div>
            ) : (
              <div className="card card-glass stack-sm">
                <strong>Included in subscription boxes</strong>
                <p className="muted">
                  This book ships to families with this language pair. The code printed inside the back cover unlocks
                  its narration.
                </p>
                <div>
                  <Link href="/plans" className="btn btn-primary">
                    See plans
                  </Link>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
