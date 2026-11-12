import { isRtl } from '@/lib/languages';

/**
 * A CSS 3D hardcover book: front cover, spine, page block, top edge and back.
 * Angle comes from --rx/--ry (set per size in CSS) plus optional --tilt-x/--tilt-y
 * from a parent <Tilt>, so it follows the mouse.
 */
export default function BookCover({ book, size = 'md' }) {
  const { title = {}, languages = {} } = book;
  return (
    <div className={`book3d book3d-${size}`} style={{ '--cover': book.coverColor || '#f4a261' }}>
      <div className="book3d-inner">
        <div className="book3d-face book3d-front">
          <span className="cover-emoji" aria-hidden="true">
            {book.coverEmoji || '📖'}
          </span>
          <span className="cover-title" lang={languages.primary} dir={isRtl(languages.primary) ? 'rtl' : undefined}>
            {title.primary}
          </span>
          <span className="cover-subtitle" lang={languages.secondary} dir={isRtl(languages.secondary) ? 'rtl' : undefined}>
            {title.secondary}
          </span>
          <span className="cover-shine" aria-hidden="true" />
        </div>
        <div className="book3d-face book3d-spine" aria-hidden="true" />
        <div className="book3d-face book3d-pages" aria-hidden="true" />
        <div className="book3d-face book3d-top" aria-hidden="true" />
        <div className="book3d-face book3d-back" aria-hidden="true" />
      </div>
    </div>
  );
}
