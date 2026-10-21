import Link from 'next/link';
import { PageShell } from '@/components/SiteChrome';
import { about, company, pages } from '@/content';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ ...pages.oNas, path: '/o-nas/' });

export default function Page() {
  return (
    <PageShell current="/o-nas/">
      <section className="page-hero">
        <p className="page-kicker" data-in>O nas</p>
        <h1 className="page-title" data-in>{pages.oNas.h1}</h1>
        <p className="page-lead" data-in>{about.paragraphs[0]}</p>
      </section>

      <section className="page-section page-split" aria-labelledby="kim-jestesmy">
        <h2 id="kim-jestesmy" className="section-title" data-in>Doświadczenie i uprawnienia</h2>
        <div className="prose" data-in>{about.paragraphs.slice(1).map((p) => <p key={p}>{p}</p>)}</div>
      </section>

      <section className="page-section" aria-labelledby="dlaczego-my">
        <h2 id="dlaczego-my" className="section-title" data-in>Dlaczego my?</h2>
        <ul className="tile-grid tile-grid--4">
          {about.values.map((v) => (
            <li key={v.title} className="tile tile--tall" data-in>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-cta" data-in>
        <h2 className="section-title">{company.name} — {company.owner}</h2>
        <p className="page-text">NIP {company.nip} · REGON {company.regon}</p>
        <div className="cta-row">
          <Link className="btn btn-dark" href="/oferta/">Zobacz ofertę</Link>
          <Link className="btn btn-soft" href="/kontakt/">Kontakt</Link>
        </div>
      </section>
    </PageShell>
  );
}
