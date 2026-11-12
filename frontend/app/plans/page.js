'use client';

import Link from 'next/link';
import { Alert, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { formatPrice } from '@/lib/format';

export default function PlansPage() {
  const { user } = useAuth();
  const { data, error, loading } = useApi('/plans');

  const hrefFor = (slug) => {
    const target = `/subscribe?plan=${slug}`;
    return user ? target : `/register?next=${encodeURIComponent(target)}`;
  };

  return (
    <div className="container section">
      <div className="center">
        <h1>Choose your plan</h1>
        <p className="lead muted">
          Every plan includes hardcover bilingual books and unlimited read-along audio. Pause or cancel anytime.
        </p>
      </div>
      {loading && <Spinner />}
      <Alert error={error} />
      {data && (
        <div className="grid grid-3 plans">
          {data.items.map((plan, i) => (
            <article key={plan._id} className={`card plan ${i === 1 ? 'plan-featured' : ''}`}>
              {i === 1 && <span className="plan-ribbon">Most popular</span>}
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
              <Link href={hrefFor(plan.slug)} className={`btn ${i === 1 ? 'btn-primary' : 'btn-outline'} btn-block`}>
                Choose {plan.name}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
