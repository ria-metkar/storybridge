'use client';

import BookCard from '@/components/BookCard';
import { Alert, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';

export default function FeaturedBooks() {
  const { data, error, loading } = useApi('/books', { query: { limit: 4 } });
  if (loading) return <Spinner />;
  if (error) return <Alert error={error} />;
  return (
    <div className="grid grid-books">
      {data.items.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
}
