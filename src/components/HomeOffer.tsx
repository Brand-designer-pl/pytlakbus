import Link from 'next/link';
import { about, area, offer } from '@/content';
import { ServiceIcon } from '@/components/ServiceIcon';

/** Sekcja pod sceną: oferta i obszar działania w zwykłym HTML (treść dla Google i dla osób bez animacji). */
export function HomeOffer() {
  return (
    <section className="home-offer" aria-labelledby="home-offer-title">
      <div className="home-offer-head">
        <p className="page-kicker">Oferta</p>
        <h2 id="home-offer-title" className="section-title section-title--lg">Przewóz osób busami z kierowcą — Puszczykowo, Poznań i okolice</h2>
        <p className="page-text">{offer.lead}</p>
      </div>
      <ul className="tile-grid">
        {offer.services.slice(0, 9).map((s, i) => (
          <li key={s} className="tile"><span className="tile-head" aria-hidden="true"><span className="tile-num">{String(i + 1).padStart(2, '0')}</span><ServiceIcon index={i} /></span>{s}</li>
        ))}
      </ul>
      <div className="home-offer-foot">
        <div>
          <h3 className="home-offer-sub">Obszar działania</h3>
          <ul className="chip-list">{area.map((a) => <li key={a} className="pill">{a}</li>)}</ul>
        </div>
        <p className="page-text">{about.paragraphs[1]}</p>
        <div className="cta-row">
          <Link className="btn btn-dark" href="/oferta/">Pełna oferta</Link>
          <Link className="btn btn-soft" href="/flota/">Cała flota</Link>
          <Link className="btn btn-soft" href="/o-nas/">O firmie</Link>
        </div>
      </div>
    </section>
  );
}
