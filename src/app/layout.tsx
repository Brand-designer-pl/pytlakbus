import type { Metadata, Viewport } from 'next';
import { Inter_Tight } from 'next/font/google';
import './globals.css';
import { asset } from '@/lib/asset';

const sans = Inter_Tight({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'PytlakBus — Bezpieczeństwo i komfort podróży',
  description: 'Przewóz osób 7 dni w tygodniu, 24 godziny na dobę. Nowoczesna flota od Mercedesa Vito po Sprintera.',
};
export const viewport: Viewport = { themeColor: '#000000' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={sans.variable} style={{ '--logo-url': `url(${asset('/media/logo-pytlakbus.png')})` } as React.CSSProperties}>
      <body>
        <a className="skip" href="#main">Przejdź do treści</a>
        {children}
      </body>
    </html>
  );
}
