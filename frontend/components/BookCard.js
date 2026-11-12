import Link from 'next/link';
import BookCover from './BookCover';
import Tilt from './Tilt';
import { LanguagePair } from './ui';
import { ageRange } from '@/lib/format';

export default function BookCard({ book }) {
  return (
    <Link href={`/books/${book.slug}`} className="book-card">
      <Tilt className="book-card-stage" max={16}>
        <BookCover book={book} />
        {book.isSample && <span className="ribbon">Free sample</span>}
      </Tilt>
      <div className="book-card-body">
        <h3>{book.title.primary}</h3>
        <LanguagePair languages={book.languages} />
        <span className="badge">{ageRange(book)}</span>
      </div>
    </Link>
  );
}
