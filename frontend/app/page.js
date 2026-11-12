import Link from 'next/link';
import FeaturedBooks from './FeaturedBooks';
import HeroScene from '@/components/HeroScene';
import Marquee from '@/components/Marquee';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';

const STEPS = [
  {
    icon: '🗣️',
    title: 'Pick your family’s languages',
    text: 'English ⇄ Spanish, Hindi ⇄ English, Mandarin ⇄ English and more. Every page is printed in both, side by side.',
  },
  {
    icon: '📦',
    title: 'Hardcovers arrive monthly',
    text: 'Picture books matched to your child’s age and languages, delivered to your door. Never the same book twice.',
  },
  {
    icon: '🎧',
    title: 'Scan, press play, read along',
    text: 'The code inside each back cover unlocks native-speaker narration. Words light up as they’re read.',
  },
];

const PERKS = [
  ['✨', 'Line-by-line highlighting', 'Kids follow the words as a native speaker reads them aloud.'],
  ['🔀', 'One language or both', 'Focus on Grandma’s language tonight, both tomorrow.'],
  ['🐢', 'Slow, normal or fast', 'Slow it down for little ones learning new sounds.'],
  ['📖', 'Auto page-turns', 'Hands-free bedtime: the story turns its own pages.'],
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="stars" aria-hidden="true" />
        <div className="moon" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="pill">
              <span className="pill-dot" /> For multilingual families
            </span>
            <h1>
              Bedtime stories in <span className="text-gradient">both of your languages.</span>
            </h1>
            <p className="lead">
              Bilingual picture books delivered monthly, with native-speaker audio that follows along word by word, so
              your child hears Grandma’s language even on nights Grandma isn’t there.
            </p>
            <div className="row gap wrap">
              <Link href="/plans" className="btn btn-primary btn-lg">
                See plans
              </Link>
              <Link href="/listen/MOON-ES" className="btn btn-glass btn-lg">
                <span className="play-dot" aria-hidden="true">▶</span> Try a free story
              </Link>
            </div>
            <ul className="hero-trust">
              <li>
                <strong>11</strong> languages
              </li>
              <li>
                <strong>Native</strong> narrators
              </li>
              <li>
                <strong>Pause</strong> anytime
              </li>
            </ul>
          </div>
          <HeroScene />
        </div>
        <svg className="hero-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,64 C240,120 480,0 720,48 C960,96 1200,24 1440,64 L1440,120 L0,120 Z" />
        </svg>
      </section>

      <Marquee />

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">How it works</span>
            <h2 className="section-title">From mailbox to bedtime in three steps</h2>
          </Reveal>
          <div className="grid grid-3 steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <Tilt className="card step tilt-surface" max={8}>
                  <span className="step-num">0{i + 1}</span>
                  <span className="step-icon" aria-hidden="true">
                    {s.icon}
                  </span>
                  <h3>{s.title}</h3>
                  <p className="muted">{s.text}</p>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container split">
          <Reveal className="demo-player" aria-hidden="true">
            <div className="demo-illustration">🌙</div>
            <div className="demo-line demo-line-a">
              <small>English</small>
              Every night, the moon visits the old mango tree.
            </div>
            <div className="demo-line demo-line-b">
              <small>Español</small>
              Cada noche, la luna visita el viejo árbol de mango.
            </div>
            <div className="demo-controls">
              <span className="demo-play">▶</span>
              <span className="eq on">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="demo-progress">
                <span />
              </span>
            </div>
          </Reveal>
          <Reveal delay={150} className="stack">
            <span className="eyebrow">The read-along player</span>
            <h2>Words light up as they’re read</h2>
            <p className="lead muted">
              Every book has a code under the QR in its back cover. Enter it on any phone, tablet or laptop and the story
              comes alive.
            </p>
            <ul className="perks">
              {PERKS.map(([icon, title, text]) => (
                <li key={title}>
                  <span className="perk-icon" aria-hidden="true">
                    {icon}
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p className="muted small">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div>
              <Link href="/listen/MOON-ES" className="btn btn-primary">
                ▶ Play the free sample
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="row between wrap gap section-head-row">
            <div>
              <span className="eyebrow">Fresh off the press</span>
              <h2 className="section-title">New on the shelf</h2>
            </div>
            <Link href="/books" className="link-arrow">
              Browse all books <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <FeaturedBooks />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="cta-band">
            <div className="stars" aria-hidden="true" />
            <div className="cta-copy">
              <h2>Start your family’s bilingual bookshelf</h2>
              <p>Plans from one book a month. Pause or cancel whenever you like.</p>
            </div>
            <Link href="/plans" className="btn btn-light btn-lg">
              Choose a plan
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
