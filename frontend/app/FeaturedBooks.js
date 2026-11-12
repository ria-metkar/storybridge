'use client';

import BookCard from '@/components/BookCard';
import Reveal from '@/components/Reveal';
import { Alert } from '@/components/ui';
import { useApi } from '@/hooks/useApi';

export default function FeaturedBooks() {
  const { data, error, loading } = useApi('/books', { query: { limit: 4 } });
  if (error) return <Alert error={error} />;
  return (
    <div className="grid grid-books">
      {loading
        ? Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton-book" aria-hidden="true" />)
        : data.items.map((book, i) => (
            <Reveal key={book._id} delay={i * 90}>
              <BookCard book={book} />
            </Reveal>
          ))}
    </div>
  );
}
