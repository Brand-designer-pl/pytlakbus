import Link from 'next/link';
import type { Metadata } from 'next';
import { PageShell } from '@/components/SiteChrome';

export const metadata: Metadata = { title: { absolute: 'Nie znaleziono strony | Pytlak Przewozy' }, robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <PageShell current="">
      <section className="page-hero">
        <p className="page-kicker" data-in>Błąd 404</p>
        <h1 className="page-title" data-in>Nie znaleziono strony</h1>
        <p className="page-lead" data-in>Ta strona nie istnieje albo zmieniła adres. Sprawdź naszą ofertę i flotę lub skontaktuj się z nami.</p>
        <div className="cta-row" data-in>
          <Link className="btn btn-dark" href="/">Strona główna</Link>
          <Link className="btn btn-soft" href="/oferta/">Oferta</Link>
          <Link className="btn btn-soft" href="/flota/">Flota</Link>
          <Link className="btn btn-soft" href="/kontakt/">Kontakt</Link>
        </div>
      </section>
    </PageShell>
  );
}
