'use client';

import { useState } from 'react';
import AdminBooks from './AdminBooks';
import AdminOverview from './AdminOverview';
import AdminShipments from './AdminShipments';
import AdminSubscribers from './AdminSubscribers';
import { Spinner } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const TABS = [
  { id: 'overview', label: 'Overview', Component: AdminOverview },
  { id: 'shipments', label: 'Shipments', Component: AdminShipments },
  { id: 'books', label: 'Books', Component: AdminBooks },
  { id: 'subscribers', label: 'Subscribers', Component: AdminSubscribers },
];

export default function AdminPage() {
  const { ready } = useRequireAuth({ role: 'admin' });
  const [tab, setTab] = useState('overview');
  if (!ready) return <Spinner />;

  const { Component } = TABS.find((t) => t.id === tab);
  return (
    <div className="container section stack">
      <h1>Admin</h1>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'on' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        <Component onNavigate={setTab} />
      </div>
    </div>
  );
}
