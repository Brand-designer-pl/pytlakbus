/* eslint-disable @next/next/no-img-element -- statyczny eksport: zwykłe <img> z wymiarami */
import Link from 'next/link';
import { PageShell } from '@/components/SiteChrome';
import { fleet, pages } from '@/content';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ ...pages.flota, path: '/flota/' });

// Kolejność od najmniejszego do największego — czytelniej niż układ karuzeli.
const order = ['v250d', 'vito', 'toyota', 'trafic150', 'trafic170', 'sprinter21', 'sprinter24'];
const cars = order.map((id) => fleet.find((c) => c.id === id)!).filter(Boolean);

export default function Page() {
  return (
    <PageShell current="/flota/">
      <section className="page-hero">
        <p className="page-kicker" data-in>Flota</p>
        <h1 className="page-title" data-in>{pages.flota.h1}</h1>
        <p className="page-lead" data-in>Nowoczesna i zadbana flota — od 6-osobowego Mercedesa V250d po Sprintery na 20 i 22 pasażerów. Każdy pojazd z kierowcą, klimatyzacją i przyciemnianymi szybami.</p>
        <ul className="chip-list" data-in>
          {cars.map((c) => <li key={c.id}><a className="pill" href={`#${c.id}`}>{c.name} · {c.seats}</a></li>)}
        </ul>
      </section>

      {cars.map((car, i) => (
        <article key={car.id} id={car.id} className="fleet-card" aria-labelledby={`${car.id}-name`}>
          <div className="fleet-card-media" data-in>
            <img src={car.image} alt={`${car.name} — widok z boku`} width={1600} height={Math.round(1600 / car.ratio)}
              loading={i === 0 ? undefined : 'lazy'} decoding="async" />
          </div>
          <div className="fleet-card-body" data-in>
            <h2 id={`${car.id}-name`} className="section-title">{car.name} <span className="title-note">· {car.seats} miejsc</span></h2>
            <p className="page-text">{car.spec?.lead ?? car.blurb}</p>
            {car.spec && (
              <>
                <dl className="spec-stats">
                  {car.spec.stats.map((s) => (
                    <div key={s.label} className="spec-stat"><dt>{s.label}</dt><dd>{s.value}</dd></div>
                  ))}
                </dl>
                <div className="spec-groups">
                  {car.spec.groups.map((g) => (
                    <section key={g.title} className="spec-group">
                      <h3>{g.title}</h3>
                      <ul>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    </section>
                  ))}
                </div>
              </>
            )}
            <div className="cta-row">
              <Link className="btn btn-dark" href={`/#rezerwacja-${car.id}`}>Zarezerwuj {car.name.replace('Mercedes-Benz ', '').replace('Mercedes ', '')}</Link>
            </div>
          </div>
        </article>
      ))}
    </PageShell>
  );
}
