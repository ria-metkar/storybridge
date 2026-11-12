import Link from 'next/link';
import { Fraunces, Nunito } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const display = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Nunito({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata = {
  title: { default: 'StoryBridge: bilingual storybooks with read-along audio', template: '%s · StoryBridge' },
  description:
    'Physical bilingual picture books delivered monthly, paired with synchronized native-speaker audio for children in multicultural homes.',
};

export const viewport = { themeColor: '#15102e' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="bg-orbs" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <AuthProvider>
          <Navbar />
          <main className="main">{children}</main>
          <footer className="footer">
            <div className="container footer-grid">
              <div className="stack-sm">
                <span className="brand brand-light">
                  <span className="brand-mark" aria-hidden="true">
                    <span>A</span>
                    <span>अ</span>
                  </span>
                  StoryBridge
                </span>
                <p className="footer-muted">
                  Bilingual picture books and native-speaker narration for multicultural homes.
                </p>
              </div>
              <nav className="footer-links" aria-label="Footer">
                <strong>Explore</strong>
                <Link href="/books">Books</Link>
                <Link href="/plans">Plans</Link>
                <Link href="/listen">Enter a book code</Link>
              </nav>
              <nav className="footer-links" aria-label="Account">
                <strong>Account</strong>
                <Link href="/account">My account</Link>
                <Link href="/login">Log in</Link>
                <Link href="/register">Create account</Link>
              </nav>
            </div>
            <div className="container footer-bottom">
              <span>© {new Date().getFullYear()} StoryBridge</span>
              <span>Two languages, one bedtime story.</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
