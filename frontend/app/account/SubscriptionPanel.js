'use client';

import Link from 'next/link';
import { useState } from 'react';
import AddressFields, { cleanAddress } from '@/components/AddressFields';
import { Alert, Field, LanguagePair, LanguagePairFields, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';

const STATUS_LABEL = { active: 'Active', paused: 'Paused', cancelled: 'Cancelled' };

export default function SubscriptionPanel() {
  const { data, error, loading, setData } = useApi('/subscriptions/me');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const update = async (body) => {
    setBusy(true);
    setActionError(null);
    try {
      const res = await api('/subscriptions/me', { method: 'PATCH', body });
      setData(res);
      setEditing(false);
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    if (window.confirm('Cancel your subscription? Audio stays unlocked until the end of the paid period.')) {
      update({ action: 'cancel' });
    }
  };

  return (
    <section className="card stack" aria-labelledby="sub-heading">
      <h2 id="sub-heading">Subscription</h2>
      {loading && <Spinner />}
      <Alert error={error || actionError} />

      {data && !data.subscription && (
        <div className="stack">
          <p className="muted">You don’t have a subscription yet.</p>
          <Link href="/plans" className="btn btn-primary">
            Choose a plan
          </Link>
        </div>
      )}

      {data?.subscription && (() => {
        const sub = data.subscription;
        const live = sub.status !== 'cancelled';
        return (
          <>
            <div className="sub-summary">
              <div>
                <span className={`status status-${sub.status}`}>{STATUS_LABEL[sub.status]}</span>
                <h3>{sub.plan?.name}</h3>
                <p className="muted small">
                  {sub.plan?.booksPerMonth} {sub.plan?.booksPerMonth === 1 ? 'book' : 'books'} / month ·{' '}
                  {formatPrice(sub.plan?.priceCents)}
                </p>
              </div>
              <dl className="meta">
                <dt>Languages</dt>
                <dd>
                  <LanguagePair languages={sub.languages} />
                </dd>
                <dt>{sub.status === 'active' ? 'Renews' : 'Audio access until'}</dt>
                <dd>{formatDate(sub.currentPeriodEnd)}</dd>
                <dt>Ships to</dt>
                <dd>
                  {sub.shippingAddress.fullName}, {sub.shippingAddress.city}, {sub.shippingAddress.country}
                </dd>
              </dl>
            </div>

            {live ? (
              <div className="row gap wrap">
                <button className="btn btn-outline btn-sm" onClick={() => setEditing((e) => !e)} disabled={busy}>
                  {editing ? 'Close editor' : 'Change plan, languages or address'}
                </button>
                {sub.status === 'active' ? (
                  <button className="btn btn-outline btn-sm" onClick={() => update({ action: 'pause' })} disabled={busy}>
                    Pause deliveries
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => update({ action: 'resume' })} disabled={busy}>
                    Resume deliveries
                  </button>
                )}
                <button className="btn btn-ghost btn-sm danger" onClick={cancel} disabled={busy}>
                  Cancel subscription
                </button>
              </div>
            ) : (
              <Link href="/plans" className="btn btn-primary">
                Start a new subscription
              </Link>
            )}

            {editing && live && <EditSubscription sub={sub} busy={busy} onSave={update} />}
          </>
        );
      })()}
    </section>
  );
}

function EditSubscription({ sub, busy, onSave }) {
  const plans = useApi('/plans');
  const [planSlug, setPlanSlug] = useState(sub.plan?.slug ?? '');
  const [languages, setLanguages] = useState(sub.languages);
  const [address, setAddress] = useState({ line2: '', state: '', ...sub.shippingAddress });

  return (
    <form
      className="stack edit-panel"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ planSlug, languages, shippingAddress: cleanAddress(address) });
      }}
    >
      <Field label="Plan" hint="Plan changes apply from your next box.">
        <select className="input" value={planSlug} onChange={(e) => setPlanSlug(e.target.value)}>
          {plans.data?.items.map((p) => (
            <option key={p._id} value={p.slug}>
              {p.name}: {formatPrice(p.priceCents)}/mo
            </option>
          ))}
        </select>
      </Field>
      <LanguagePairFields value={languages} onChange={setLanguages} />
      <AddressFields value={address} onChange={setAddress} />
      <button className="btn btn-primary" disabled={busy}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
