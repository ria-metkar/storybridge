import { isRtl } from '@/lib/languages';

export default function BookCover({ book, size = 'md' }) {
  const { title = {}, languages = {} } = book;
  return (
    <div className={`cover cover-${size}`} style={{ '--cover': book.coverColor || '#f4a261' }}>
      <span className="cover-emoji" aria-hidden="true">
        {book.coverEmoji || '📖'}
      </span>
      <span className="cover-title" lang={languages.primary} dir={isRtl(languages.primary) ? 'rtl' : undefined}>
        {title.primary}
      </span>
      <span className="cover-subtitle" lang={languages.secondary} dir={isRtl(languages.secondary) ? 'rtl' : undefined}>
        {title.secondary}
      </span>
    </div>
  );
}
