'use client';
import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, motionOK } from '@/lib/gsap';
import { company, contact } from '@/content';
import { MobileNav } from '@/components/MobileNav';

export const navItems = [
  { href: '/', label: 'Start' },
  { href: '/oferta/', label: 'Oferta' },
  { href: '/flota/', label: 'Flota' },
  { href: '/o-nas/', label: 'O nas' },
  { href: '/kontakt/', label: 'Kontakt' },
] as const;

/** Nagłówek podstron (jasny). Strona główna ma własny, animowany wariant w Landing.tsx. */
export function SiteHeader({ current }: { current: string }) {
  return (
    <header className="site-header is-light site-header--page">
      <Link className="logo" href="/" aria-label="PytlakBus — strona główna"><span className="logo-img" aria-hidden="true" /></Link>
      <nav aria-label="Menu główne">
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={item.href === current ? 'is-current' : undefined} aria-current={item.href === current ? 'page' : undefined}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <Link className="btn btn-nav" href="/#rezerwacja">Zarezerwuj</Link>
      <MobileNav current={current} />
    </header>
  );
}

/** Stopka wszystkich stron: dane kontaktowe i rejestrowe, linki do podstron. */
export function SiteFooter({ onReserve }: { onReserve?: (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <footer id="stopka" className="site-footer">
      <p className="footer-kicker">Zapytaj o termin</p>
      <h2 className="footer-title">Umów przewóz<br />na konkretny termin.</h2>
      <div className="footer-row">
        <Link className="btn btn-light" href="/#rezerwacja" onClick={onReserve}>Zarezerwuj przejazd</Link>
        {contact.phone && <a className="btn btn-soft" href={contact.phone.href}>{contact.phone.display}</a>}
        <span className="muted">{contact.hours}</span>
      </div>
      <div className="footer-grid">
        <address className="footer-contact">
          <strong>{company.name}</strong>
          {contact.address && <span>{contact.address}</span>}
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          {contact.phone && <a href={contact.phone.href}>tel. {contact.phone.display}</a>}
          {contact.phone2 && <a href={contact.phone2.href}>tel. {contact.phone2.display}</a>}
        </address>
        <nav aria-label="Stopka" className="footer-nav">
          {navItems.slice(1).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <Link href="/polityka-prywatnosci/">Polityka prywatności</Link>
        </nav>
      </div>
      <p className="footer-legal muted">© {new Date().getFullYear()} {company.name} · {company.owner} · NIP {company.nip} · REGON {company.regon}</p>
    </footer>
  );
}

/** Szkielet podstrony: nagłówek, treść z wejściem (rozmyte elementy [data-in] wyostrzają się kaskadowo), stopka. */
export function PageShell({ current, children }: { current: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(motionOK, () => {
      gsap.fromTo(gsap.utils.selector(root)('[data-in]'), { opacity: 0, y: 24, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.06, ease: 'power3.out', clearProps: 'opacity,transform,filter' });
    });
    return () => mm.revert();
  }, { scope: root });
  return (
    <div ref={root} className="page">
      <SiteHeader current={current} />
      <main id="main" className="page-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
