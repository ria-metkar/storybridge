import Link from 'next/link';
import FeaturedBooks from './FeaturedBooks';
import { LANGUAGES } from '@/lib/languages';

const STEPS = [
  {
    icon: '🗣️',
    title: 'Pick your family’s languages',
    text: 'English ⇄ Spanish, Hindi ⇄ English, Mandarin ⇄ English and more. Each book is printed in both, side by side.',
  },
  {
    icon: '📦',
    title: 'Books arrive every month',
    text: 'Hardcover picture books chosen for your child’s age and languages, delivered to your door.',
  },
  {
    icon: '🎧',
    title: 'Scan the code and read along',
    text: 'Each book has a code inside the back cover. Enter it to hear a native speaker read every line while the words light up.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <p className="eyebrow">For multilingual families</p>
            <h1>Bedtime stories in both of your languages.</h1>
            <p className="lead">
              Picture books printed in two languages, with native-speaker audio that follows along word by word.
              Your child hears Grandma’s language even on nights Grandma isn’t there.
            </p>
            <div className="row gap wrap">
              <Link href="/plans" className="btn btn-primary btn-lg">
                See plans
              </Link>
              <Link href="/listen/MOON-ES" className="btn btn-outline btn-lg">
                ▶ Try a free story
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-book">
              <span>🌙</span>
              <p>Every night, the moon visits the old mango tree.</p>
              <p className="alt">Cada noche, la luna visita el viejo árbol de mango.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="grid grid-3">
            {STEPS.map((s) => (
              <div key={s.title} className="card step">
                <span className="step-icon" aria-hidden="true">
                  {s.icon}
                </span>
                <h3>{s.title}</h3>
                <p className="muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="row between wrap gap">
            <h2 className="section-title">New on the shelf</h2>
            <Link href="/books">Browse all books →</Link>
          </div>
          <FeaturedBooks />
        </div>
      </section>

      <section className="section">
        <div className="container center">
          <h2 className="section-title">Languages we publish in</h2>
          <ul className="lang-cloud">
            {Object.entries(LANGUAGES).map(([code, l]) => (
              <li key={code} lang={code}>
                {l.native}
              </li>
            ))}
          </ul>
          <Link href="/plans" className="btn btn-primary btn-lg">
            Start your subscription
          </Link>
        </div>
      </section>
    </>
  );
}
