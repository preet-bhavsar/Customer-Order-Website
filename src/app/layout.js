import './globals.css';
import Link from 'next/link';
import LogoutButton from '@/components/ui/LogoutButton';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: 'Swagat Samosa Center - Order Manager',
  description: 'Bulk order management system for Swagat Samosa Center',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header className="header">
              <Link href="/" style={{ textDecoration: 'none' }}>
                <div className="logo">
                  🥟 Swagat Samosa Center
                </div>
              </Link>
              <nav style={{ display: 'flex', alignItems: 'center' }}>
                <Link href="/new" className="btn btn-primary">
                  + New Order
                </Link>
              </nav>
            </header>
            <main style={{ flex: '1 0 auto' }}>{children}</main>
            <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
              <LogoutButton />
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
