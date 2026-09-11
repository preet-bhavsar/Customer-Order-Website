import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Swagat Samosa Center - Order Manager',
  description: 'Bulk order management system for Swagat Samosa Center',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div className="logo">
                🥟 Swagat Samosa Center
              </div>
            </Link>
            <nav>
              <Link href="/new" className="btn btn-primary">
                + New Order
              </Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
