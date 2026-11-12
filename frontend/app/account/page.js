'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ChildrenPanel from './ChildrenPanel';
import ShipmentsPanel from './ShipmentsPanel';
import SubscriptionPanel from './SubscriptionPanel';
import { Alert, Spinner } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';

function Account() {
  const { user, ready } = useRequireAuth();
  const welcome = useSearchParams().get('welcome');
  if (!ready) return <Spinner />;

  return (
    <div className="container section stack-lg">
      <div>
        <h1>Hi, {user.name.split(' ')[0]} 👋</h1>
        <p className="muted">{user.email}</p>
      </div>
      {welcome && (
        <Alert tone="success">
          You’re subscribed! Your first box is being prepared. Each book has a code inside its back cover that unlocks
          the narration.
        </Alert>
      )}
      <SubscriptionPanel />
      <ShipmentsPanel />
      <ChildrenPanel />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Account />
    </Suspense>
  );
}
