'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import AddressFields, { EMPTY_ADDRESS, cleanAddress } from '@/components/AddressFields';
import { Alert, Field, LanguagePairFields, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';

function SubscribeForm() {
  const { user, ready } = useRequireAuth();
  const router = useRouter();
  const params = useSearchParams();

  const plans = useApi(ready ? '/plans' : null);
  const current = useApi(ready ? '/subscriptions/me' : null);

  const [planSlug, setPlanSlug] = useState(params.get('plan') || '');
  const [languages, setLanguages] = useState({ primary: 'en', secondary: 'es' });
  const [childId, setChildId] = useState('');
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) setAddress((a) => ({ ...a, fullName: a.fullName || user.name }));
  }, [user]);

  useEffect(() => {
    if (!planSlug && plans.data?.items.length) setPlanSlug(plans.data.items[0].slug);
  }, [plans.data, planSlug]);

  const liveSub = ['active', 'paused'].includes(current.data?.subscription?.status);
  useEffect(() => {
    if (liveSub) router.replace('/account');
  }, [liveSub, router]);

  if (!ready || plans.loading || current.loading || liveSub) return <Spinner />;

  const selectedPlan = plans.data?.items.find((p) => p.slug === planSlug);

  const chooseChild = (id) => {
    setChildId(id);
    const child = user.children.find((c) => c._id === id);
    if (child) setLanguages({ primary: child.primaryLanguage, secondary: child.secondaryLanguage });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api('/subscriptions', {
        method: 'POST',
        body: {
          planSlug,
          languages,
          childId: childId || undefined,
          shippingAddress: cleanAddress(address),
        },
      });
      router.push('/account?welcome=1');
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="container section narrow-wide">
      <h1>Set up your subscription</h1>
      <Alert error={plans.error || current.error} />
      <form className="stack" onSubmit={onSubmit}>
        <fieldset className="card stack">
          <legend>1. Plan</legend>
          <div className="plan-options">
            {plans.data?.items.map((p) => (
              <label key={p._id} className={`option ${planSlug === p.slug ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="plan"
                  value={p.slug}
                  checked={planSlug === p.slug}
                  onChange={() => setPlanSlug(p.slug)}
                />
                <strong>{p.name}</strong>
                <span className="muted small">
                  {p.booksPerMonth} {p.booksPerMonth === 1 ? 'book' : 'books'} / month · {formatPrice(p.priceCents)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="card stack">
          <legend>2. Languages</legend>
          {user.children.length > 0 && (
            <Field label="Who is this for?" hint="We’ll match books to their age and languages.">
              <select className="input" value={childId} onChange={(e) => chooseChild(e.target.value)}>
                <option value="">The whole family</option>
                {user.children.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <LanguagePairFields value={languages} onChange={setLanguages} />
        </fieldset>

        <fieldset className="card stack">
          <legend>3. Delivery address</legend>
          <AddressFields value={address} onChange={setAddress} />
        </fieldset>

        <div className="card card-soft row between wrap gap">
          <div>
            <strong>{selectedPlan?.name ?? 'Choose a plan'}</strong>
            <div className="muted small">
              Billed monthly. This demo uses a mock payment step, so you won’t be charged.
            </div>
          </div>
          <div className="row gap">
            {selectedPlan && <span className="plan-price-sm">{formatPrice(selectedPlan.priceCents)}/mo</span>}
            <button className="btn btn-primary btn-lg" disabled={submitting || !planSlug}>
              {submitting ? 'Subscribing…' : 'Start subscription'}
            </button>
          </div>
        </div>
        <Alert error={error} />
      </form>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SubscribeForm />
    </Suspense>
  );
}
