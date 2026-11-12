'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const LINKS = [
  { href: '/books', label: 'Books' },
  { href: '/plans', label: 'Plans' },
  { href: '/listen', label: 'Enter a book code' },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span aria-hidden="true">📚</span> StoryBridge
        </Link>
        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <nav id="nav-menu" className={`nav-menu ${open ? 'open' : ''}`}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
              {l.label}
            </Link>
          ))}
          {!loading &&
            (user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className={isActive('/admin') ? 'active' : ''}>
                    Admin
                  </Link>
                )}
                <Link href="/account" className={isActive('/account') ? 'active' : ''}>
                  My account
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link href="/plans" className="btn btn-primary btn-sm">
                  Subscribe
                </Link>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
