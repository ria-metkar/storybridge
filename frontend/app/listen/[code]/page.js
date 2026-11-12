'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReadAlongPlayer from '@/components/ReadAlongPlayer';
import { Alert, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';

export default function ListenPage() {
  const { code } = useParams();
  const { user, loading: authLoading } = useAuth();
  // Re-fetch once the session is known so a fresh login unlocks the book.
  const { data, error, loading } = useApi(authLoading ? null : `/books/listen/${encodeURIComponent(code)}`, {
    key: user?._id,
  });

  if (authLoading || loading || (!data && !error)) return <Spinner label="Opening your story…" />;

  if (error) {
    const next = encodeURIComponent(`/listen/${code}`);
    return (
      <div className="container section narrow stack">
        <Alert error={error} />
        {error.code === 'UNAUTHENTICATED' && (
          <div className="row gap wrap">
            <Link href={`/login?next=${next}`} className="btn btn-primary">
              Log in
            </Link>
            <Link href={`/register?next=${next}`} className="btn btn-outline">
              Create an account
            </Link>
          </div>
        )}
        {error.code === 'SUBSCRIPTION_REQUIRED' && (
          <Link href="/plans" className="btn btn-primary">
            Choose a plan
          </Link>
        )}
        {error.code === 'BOOK_NOT_FOUND' && (
          <Link href="/listen" className="btn btn-outline">
            Try another code
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="container section">
      <ReadAlongPlayer book={data.book} />
    </div>
  );
}
