'use client';

import Link from 'next/link';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';
import { Alert, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { formatPrice } from '@/lib/format';

const ICONS = ['📕', '📚', '🚀'];

export default function PlansPage() {
  const { user } = useAuth();
  const { data, error, loading } = useApi('/plans');

  const hrefFor = (slug) => {
    const target = `/subscribe?plan=${slug}`;
    return user ? target : `/register?next=${encodeURIComponent(target)}`;
  };

  return (
    <>
      <section className="page-hero">
        <div className="stars" aria-hidden="true" />
        <div className="container center">
          <span className="pill">
            <span className="pill-dot" /> Every plan includes read-along audio
          </span>
          <h1>Choose your plan</h1>
          <p className="lead">Hardcover bilingual books every month. Pause or cancel anytime.</p>
        </div>
      </section>
      <div className="container section plans-section">
        {loading && <Spinner />}
        <Alert error={error} />
        {data && (
          <div className="grid grid-3 plans">
            {data.items.map((plan, i) => (
              <Reveal key={plan._id} delay={i * 120}>
                <Tilt className={`plan tilt-surface ${i === 1 ? 'plan-featured' : ''}`} max={7}>
                  {i === 1 && <span className="plan-ribbon">Most popular</span>}
                  <span className="plan-icon" aria-hidden="true">
                    {ICONS[i] ?? '📖'}
                  </span>
                  <h2>{plan.name}</h2>
                  <p className="muted">{plan.description}</p>
                  <p className="plan-price">
                    {formatPrice(plan.priceCents)}
                    <span className="muted"> / month</span>
                  </p>
                  <ul className="checklist">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Link
                    href={hrefFor(plan.slug)}
                    className={`btn ${i === 1 ? 'btn-primary' : 'btn-outline'} btn-block`}
                  >
                    Choose {plan.name}
                  </Link>
                </Tilt>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
