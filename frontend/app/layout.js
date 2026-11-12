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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="main">{children}</main>
          <footer className="footer">
            <div className="container row between wrap gap">
              <span>© {new Date().getFullYear()} StoryBridge. Two languages, one bedtime story.</span>
              <span className="muted">Every book comes with a code that unlocks its narration.</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
