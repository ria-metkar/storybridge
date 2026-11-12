'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const LINKS = [
  { href: '/books', label: 'Books' },
  { href: '/plans', label: 'Plans' },
  { href: '/listen', label: 'Enter a code' },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The home hero is dark, so the nav starts light-on-dark there until you scroll.
  const onDark = pathname === '/' && !scrolled && !open;
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''} ${onDark ? 'on-dark' : ''}`}>
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span>A</span>
            <span>अ</span>
          </span>
          StoryBridge
        </Link>
        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="nav-menu" className={`nav-menu ${open ? 'open' : ''}`}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link ${isActive(l.href) ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
          {!loading &&
            (user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    Admin
                  </Link>
                )}
                <Link href="/account" className={`nav-link ${isActive('/account') ? 'active' : ''}`}>
                  My account
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                  Log in
                </Link>
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
