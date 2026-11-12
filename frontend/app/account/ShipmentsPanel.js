'use client';

import Link from 'next/link';
import BookCover from '@/components/BookCover';
import { Alert, EmptyState, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { formatDate, formatPeriod } from '@/lib/format';

const STATUS_TEXT = {
  pending: 'Being packed',
  shipped: 'On its way',
  delivered: 'Delivered',
};

export default function ShipmentsPanel() {
  const { data, error, loading } = useApi('/users/me/shipments');

  return (
    <section className="card stack" aria-labelledby="ship-heading">
      <h2 id="ship-heading">Your books</h2>
      {loading && <Spinner />}
      <Alert error={error} />
      {data?.items.length === 0 && (
        <EmptyState title="No boxes yet">
          <p className="muted">Your monthly box will show up here once it’s packed.</p>
        </EmptyState>
      )}
      {data?.items.map((s) => (
        <article key={s._id} className="shipment">
          <header className="row between wrap gap-sm">
            <h3>{formatPeriod(s.period)} box</h3>
            <span className={`status status-${s.status}`}>
              {STATUS_TEXT[s.status]}
              {s.status === 'shipped' && s.shippedAt && ` · ${formatDate(s.shippedAt)}`}
              {s.status === 'delivered' && s.deliveredAt && ` · ${formatDate(s.deliveredAt)}`}
            </span>
          </header>
          {s.trackingNumber && <p className="muted small">Tracking: {s.trackingNumber}</p>}
          <div className="shipment-books">
            {s.books.filter(Boolean).map((b) => (
              <div key={b._id} className="shipment-book">
                <BookCover book={b} size="sm" />
                <div className="stack-sm">
                  <strong>{b.title.primary}</strong>
                  <Link href={`/listen/${b.audioCode}`} className="btn btn-primary btn-sm">
                    ▶ Read along
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
