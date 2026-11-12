'use client';

import { useState } from 'react';
import { Alert, EmptyState, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { formatDate, formatPeriod } from '@/lib/format';

export default function AdminShipments() {
  const [status, setStatus] = useState('pending');
  const { data, error, loading, setData } = useApi('/admin/shipments', { query: { status } });
  const [rowError, setRowError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [tracking, setTracking] = useState({});

  const advance = async (shipment, next) => {
    setBusyId(shipment._id);
    setRowError(null);
    try {
      const body = { status: next };
      if (tracking[shipment._id]) body.trackingNumber = tracking[shipment._id];
      await api(`/admin/shipments/${shipment._id}`, { method: 'PATCH', body });
      // Remove from the current filtered list.
      setData((d) => ({ ...d, items: d.items.filter((s) => s._id !== shipment._id) }));
    } catch (err) {
      setRowError(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="stack">
      <div className="segmented" role="radiogroup" aria-label="Filter by status">
        {['pending', 'shipped', 'delivered'].map((s) => (
          <button key={s} role="radio" aria-checked={status === s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {loading && <Spinner />}
      <Alert error={error || rowError} />
      {data?.items.length === 0 && <EmptyState title={`No ${status} shipments`} />}
      {data?.items.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Customer</th>
                <th>Ship to</th>
                <th>Books</th>
                <th>{status === 'pending' ? 'Tracking #' : 'Shipped'}</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((s) => (
                <tr key={s._id}>
                  <td>{formatPeriod(s.period)}</td>
                  <td>
                    {s.user?.name}
                    <div className="muted small">{s.user?.email}</div>
                  </td>
                  <td className="small">
                    {s.shippingAddress.fullName}
                    <br />
                    {s.shippingAddress.line1}
                    {s.shippingAddress.line2 && `, ${s.shippingAddress.line2}`}
                    <br />
                    {s.shippingAddress.city} {s.shippingAddress.state} {s.shippingAddress.postalCode},{' '}
                    {s.shippingAddress.country}
                  </td>
                  <td className="small">
                    {s.books.filter(Boolean).map((b) => (
                      <div key={b._id}>
                        {b.title.primary} <code>{b.audioCode}</code>
                      </div>
                    ))}
                  </td>
                  <td>
                    {status === 'pending' ? (
                      <input
                        className="input input-sm"
                        placeholder="Optional"
                        value={tracking[s._id] ?? ''}
                        onChange={(e) => setTracking({ ...tracking, [s._id]: e.target.value })}
                        aria-label="Tracking number"
                      />
                    ) : (
                      <span className="small">
                        {formatDate(s.shippedAt)}
                        {s.trackingNumber && <div className="muted">{s.trackingNumber}</div>}
                      </span>
                    )}
                  </td>
                  <td>
                    {status === 'pending' && (
                      <button className="btn btn-primary btn-sm" disabled={busyId === s._id} onClick={() => advance(s, 'shipped')}>
                        Mark shipped
                      </button>
                    )}
                    {status === 'shipped' && (
                      <button className="btn btn-outline btn-sm" disabled={busyId === s._id} onClick={() => advance(s, 'delivered')}>
                        Mark delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
