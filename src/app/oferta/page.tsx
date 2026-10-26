import Link from 'next/link';
import { PageShell } from '@/components/SiteChrome';
import { area, contact, offer, pages } from '@/content';
import { pageMeta } from '@/lib/seo';
import { ServiceIcon } from '@/components/ServiceIcon';

export const metadata = pageMeta({ ...pages.oferta, path: '/oferta/' });

export default function Page() {
  return (
    <PageShell current="/oferta/">
      <section className="page-hero">
        <p className="page-kicker" data-in>Oferta</p>
        <h1 className="page-title" data-in>{pages.oferta.h1}</h1>
        <p className="page-lead" data-in>{offer.lead}</p>
      </section>

      <section className="page-section" aria-labelledby="uslugi">
        <h2 id="uslugi" className="section-title" data-in>Nasze usługi przewozowe obejmują między innymi</h2>
        <ul className="tile-grid">
          {offer.services.map((s, i) => (
            <li key={s} className="tile" data-in><span className="tile-head" aria-hidden="true"><span className="tile-num">{String(i + 1).padStart(2, '0')}</span><ServiceIcon index={i} /></span>{s}</li>
          ))}
        </ul>
      </section>

      <section className="page-section page-split" aria-labelledby="obszar">
        <div data-in>
          <h2 id="obszar" className="section-title">Obszar działania</h2>
          <p className="page-text">Przewozimy pasażerów z Puszczykowa, Poznania i okolic — działamy 7 dni w tygodniu, 24 godziny na dobę.</p>
        </div>
        <ul className="chip-list" data-in>{area.map((a) => <li key={a} className="pill">{a}</li>)}</ul>
      </section>

      <section className="page-cta" data-in>
        <h2 className="section-title">Zapytaj o przejazd</h2>
        <p className="page-text">Zachęcamy do kontaktu przez formularz lub telefonicznie — z przyjemnością odpowiemy na wszystkie pytania.</p>
        <div className="cta-row">
          <Link className="btn btn-dark" href="/#rezerwacja">Zarezerwuj przejazd</Link>
          {contact.phone && <a className="btn btn-soft" href={contact.phone.href}>Zadzwoń: {contact.phone.display}</a>}
          <Link className="btn btn-soft" href="/flota/">Zobacz flotę</Link>
        </div>
      </section>
    </PageShell>
  );
}
