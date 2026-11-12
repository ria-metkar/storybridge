import BookCover from './BookCover';

const DEMO_BOOK = {
  title: { primary: 'The Moon and the Mango Tree', secondary: 'La Luna y el Árbol de Mango' },
  languages: { primary: 'en', secondary: 'es' },
  coverColor: '#3d5a80',
  coverEmoji: '🌙',
};

/** Split-screen layout for login/register: night-sky art panel + form. */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-art" aria-hidden="true">
        <div className="stars" />
        <div className="auth-book">
          <BookCover book={DEMO_BOOK} size="lg" />
        </div>
        <p className="auth-quote">
          “Cada noche, la luna visita…”
          <span>Two languages, one bedtime story.</span>
        </p>
      </aside>
      <section className="auth-form">
        <div className="auth-form-inner">
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
          {children}
        </div>
      </section>
    </div>
  );
}
