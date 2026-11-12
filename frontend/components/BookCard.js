import Link from 'next/link';
import BookCover from './BookCover';
import { LanguagePair } from './ui';
import { ageRange } from '@/lib/format';

export default function BookCard({ book }) {
  return (
    <Link href={`/books/${book.slug}`} className="book-card">
      <BookCover book={book} />
      <div className="book-card-body">
        <h3>{book.title.primary}</h3>
        <LanguagePair languages={book.languages} />
        <div className="row gap-sm">
          <span className="badge">{ageRange(book)}</span>
          {book.isSample && <span className="badge badge-accent">Free sample</span>}
        </div>
      </div>
    </Link>
  );
}
