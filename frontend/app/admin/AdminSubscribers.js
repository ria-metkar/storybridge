'use client';

import { Alert, EmptyState, LanguagePair, Spinner } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { formatDate } from '@/lib/format';

export default function AdminSubscribers() {
  const { data, error, loading } = useApi('/admin/subscriptions');

  if (loading) return <Spinner />;
  if (error) return <Alert error={error} />;
  if (!data.items.length) return <EmptyState title="No subscriptions yet" />;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Plan</th>
            <th>Languages</th>
            <th>Status</th>
            <th>Period ends</th>
            <th>Since</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((s) => (
            <tr key={s._id}>
              <td>
                {s.user?.name ?? 'Deleted user'}
                <div className="muted small">{s.user?.email}</div>
              </td>
              <td>{s.plan?.name}</td>
              <td>
                <LanguagePair languages={s.languages} />
              </td>
              <td>
                <span className={`status status-${s.status}`}>{s.status}</span>
              </td>
              <td>{formatDate(s.currentPeriodEnd)}</td>
              <td>{formatDate(s.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
