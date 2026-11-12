'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/** Redirects to /login (or home, for a wrong role) and reports when the page may render. */
export function useRequireAuth({ role } = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (role && user.role !== role) router.replace('/');
  }, [loading, user, role, router, pathname]);

  return { user, ready: !loading && Boolean(user) && (!role || user.role === role) };
}
