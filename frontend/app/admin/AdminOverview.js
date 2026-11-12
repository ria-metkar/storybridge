'use client';

import { useState } from 'react';
import { Alert, Field, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { formatPeriod, formatPrice } from '@/lib/format';

const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function AdminOverview({ onNavigate }) {
  const { data, error, loading, reload } = useApi('/admin/stats');
  const [period, setPeriod] = useState(currentPeriod());
  const [result, setResult] = useState(null);
  const [genError, setGenError] = useState(null);
  const [busy, setBusy] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setGenError(null);
    setResult(null);
    try {
      setResult(await api('/admin/shipments/generate', { method: 'POST', body: { period } }));
      reload();
    } catch (err) {
      setGenError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack-lg">
      {loading && <Spinner />}
      <Alert error={error} />
      {data && (
        <div className="stats">
          <Stat label="Customers" value={data.customers} />
          <Stat label="Active subscriptions" value={data.activeSubscriptions} />
          <Stat label="Monthly recurring revenue" value={formatPrice(data.monthlyRecurringRevenueCents)} />
          <Stat label="Books in catalogue" value={data.books} />
          <Stat label="Boxes waiting to ship" value={data.pendingShipments} />
        </div>
      )}

      <form className="card stack" onSubmit={generate}>
        <h2>Build monthly boxes</h2>
        <p className="muted">
          For each active subscription, picks the next books in the family’s language pair (matched to the child’s age)
          that they haven’t received yet. Running it twice for the same month won’t create duplicates.
        </p>
        <div className="row gap wrap end">
          <Field label="Month">
            <input className="input" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} required />
          </Field>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Building…' : `Build ${period ? formatPeriod(period) : ''} boxes`}
          </button>
        </div>
        <Alert error={genError} />
        {result && (
          <Alert tone="success">
            Created {result.created} {result.created === 1 ? 'box' : 'boxes'} for {formatPeriod(result.period)}.
            {result.skipped.length > 0 && (
              <ul>
                {Object.entries(
                  result.skipped.reduce((acc, s) => ({ ...acc, [s.reason]: (acc[s.reason] || 0) + 1 }), {}),
                ).map(([reason, n]) => (
                  <li key={reason}>
                    Skipped {n}: {reason}
                  </li>
                ))}
              </ul>
            )}
            {result.created > 0 && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => onNavigate('shipments')}>
                View shipments →
              </button>
            )}
          </Alert>
        )}
      </form>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat card">
      <span className="stat-value">{value}</span>
      <span className="muted small">{label}</span>
    </div>
  );
}
