'use client';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { contact } from '@/content';

const items = [
  { href: '/', label: 'Start' },
  { href: '/oferta/', label: 'Oferta' },
  { href: '/flota/', label: 'Flota' },
  { href: '/o-nas/', label: 'O nas' },
  { href: '/kontakt/', label: 'Kontakt' },
];

/** Menu na telefonie (< 768 px): przycisk „Menu” i pełnoekranowa lista podstron. Na desktopie ukryte w CSS. */
export function MobileNav({ current, onReserve }: { current: string; onReserve?: (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const close = () => { setOpen(false); button.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add('menu-lock');
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => { document.documentElement.classList.remove('menu-lock'); window.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <>
      <button ref={button} type="button" className="menu-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(true)}>Menu</button>
      {/* Portal do <body>: nagłówek ma backdrop-filter, który ograniczałby warstwę position:fixed do samego paska. */}
      {open && createPortal(
        <div id={id} className="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mobile-nav-head">
            <span className="logo-img" aria-hidden="true" />
            <button type="button" className="menu-toggle menu-toggle--close" onClick={close}>Zamknij</button>
          </div>
          <nav aria-label="Menu główne (telefon)">
            <ul>
              {items.map((item, i) => (
                <li key={item.href}>
                  <Link ref={i === 0 ? firstLink : undefined} href={item.href} aria-current={item.href === current ? 'page' : undefined} onClick={() => setOpen(false)}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mobile-nav-foot">
            <Link className="btn btn-dark" href="/#rezerwacja" onClick={(e) => { setOpen(false); onReserve?.(e); }}>Zarezerwuj przejazd</Link>
            {contact.phone && <a className="btn btn-soft" href={contact.phone.href}>Zadzwoń: {contact.phone.display}</a>}
            {contact.phone2 && <a className="btn btn-soft" href={contact.phone2.href}>Zadzwoń: {contact.phone2.display}</a>}
            <p className="muted">{contact.hours}</p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
