'use client';
import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Car } from '@/content';

type Props = {
  car: Car;
  open: boolean;
  onClose: () => void;
  /** Zdjęcie auta na scenie — punkt startowy przejścia (FLIP). */
  getSource: () => HTMLElement | null;
  /** Elementy sceny, które chowamy pod widokiem (panel szczegółów). */
  getHidden: () => Element[];
  /** Klasa na scenie ukrywa oryginalne zdjęcie, gdy leci jego kopia. */
  getStage: () => HTMLElement | null;
  /** Gdzie oddać fokus po zamknięciu. */
  getReturnFocus: () => HTMLElement | null;
  onReserve: (event: React.MouseEvent<HTMLElement>) => void;
};

const reduceQuery = '(prefers-reduced-motion: reduce)';

/**
 * Widok specyfikacji w obrębie strony: zdjęcie przelatuje ze sceny do kafla po lewej
 * i się zmniejsza, specyfikacja wjeżdża z prawej. Zamknięcie odtwarza to samo wstecz.
 */
export function SpecView({ car, open, onClose, getSource, getHidden, getStage, getReturnFocus, onReserve }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const clone = useRef<HTMLImageElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const spec = car.spec;

  const buildRef = useRef<(() => gsap.core.Timeline) | null>(null);

  // Oś czasu żyje w kontekście useGSAP (sprzątana przy odmontowaniu); reagujemy na `open`.
  useGSAP(() => {
    if (!spec) return;
    const q = gsap.utils.selector(root);
    // Buduje przejście dla aktualnych pozycji (także po zmianie rozmiaru okna).
    buildRef.current = () => {
      gsap.set(q('.spec-stage'), { clearProps: 'transform' }); // pomiar bez skali z poprzedniego zamknięcia
      const box = inner.current!.getBoundingClientRect();
      const to = slot.current!.getBoundingClientRect();
      const from = getSource()?.getBoundingClientRect() ?? to;
      gsap.set(clone.current, { left: to.left - box.left, top: to.top - box.top, width: to.width, height: to.height });
      tl.current?.kill();
      tl.current = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' },
        onReverseComplete: () => {
          gsap.set(root.current, { autoAlpha: 0 });
          getStage()?.classList.remove('spec-open');
          document.documentElement.classList.remove('spec-lock');
          getReturnFocus()?.focus({ preventScroll: true });
        } })
        .set(root.current, { autoAlpha: 1 }, 0)
        .fromTo(q('.spec-backdrop'), { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'power1.out' }, 0)
        .fromTo(getHidden(), { y: 0, opacity: 1, filter: 'blur(0px)' }, { y: 40, opacity: 0, filter: 'blur(6px)', duration: 0.45, stagger: 0.04, ease: 'power2.in' }, 0)
        .fromTo(clone.current, { x: from.left - to.left, y: from.top - to.top, scale: from.width / to.width, transformOrigin: '0 0' },
          { x: 0, y: 0, scale: 1, duration: 1.15 }, 0.08)
        .fromTo(q('.spec-stage'), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 0.45)
        .fromTo(q('.spec-topbar > *'), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.3)
        .fromTo(q('[data-spec-in]'), { opacity: 0, x: 48, filter: 'blur(10px)' },
          { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.75, stagger: 0.06, ease: 'power3.out' }, 0.5)
        .fromTo(q('.spec-chip'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out' }, 1.0);
      if (process.env.NODE_ENV !== 'production') Object.assign(window, { __specTl: tl.current });
      return tl.current;
    };

    const reduced = window.matchMedia(reduceQuery).matches;
    if (open) {
      document.documentElement.classList.add('spec-lock');
      root.current!.scrollTop = 0;
      const t = buildRef.current();
      getStage()?.classList.add('spec-open');
      gsap.set(root.current, { autoAlpha: 1 }); // widoczny od razu, żeby fokus mógł na niego trafić
      if (reduced) t.progress(1); else t.timeScale(1).play(0);
      closeBtn.current?.focus({ preventScroll: true });
    } else if (tl.current && tl.current.progress() > 0) {
      if (reduced) tl.current.progress(0);
      else tl.current.timeScale(1.25).reverse();
    }
  }, { scope: root, dependencies: [open] });

  // Odmontowanie przy otwartym widoku nie może zostawić zablokowanego przewijania.
  useEffect(() => () => document.documentElement.classList.remove('spec-lock'), []);

  // Przy otwartym widoku: Escape zamyka, zmiana rozmiaru przelicza pozycje bez animacji.
  useEffect(() => {
    if (!open) return;
    const onResize = () => { if (tl.current && !tl.current.reversed()) buildRef.current?.().progress(1); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!spec) return null;
  return (
    <div ref={root} className="spec" role="dialog" aria-modal="true" aria-labelledby="spec-title" inert={!open}>
      <div className="spec-backdrop" />
      <div ref={inner} className="spec-inner">
        <div className="spec-topbar">
          <span className="logo-img spec-logo" aria-hidden="true" />
          <button ref={closeBtn} type="button" className="btn btn-soft spec-close" onClick={onClose}>
            <svg aria-hidden="true" width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M13 6H1.5M6 1 1 6l5 5" /></svg>
            Wróć do floty
          </button>
        </div>

        <div className="spec-media">
          <div className="spec-stage">
            <div ref={slot} className="spec-slot" style={{ aspectRatio: car.ratio }} />
            <ul className="spec-chips" aria-label="W skrócie">
              {spec.chips.map((c) => <li key={c} className="pill spec-chip">{c}</li>)}
            </ul>
          </div>
        </div>

        <div className="spec-body">
          <p className="spec-kicker" data-spec-in>Flota · Specyfikacja</p>
          <h2 id="spec-title" className="spec-title" data-spec-in>{car.name}</h2>
          <p className="spec-lead" data-spec-in>{spec.lead}</p>
          <dl className="spec-stats">
            {spec.stats.map((s) => (
              <div key={s.label} className="spec-stat" data-spec-in>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <div className="spec-groups">
            {spec.groups.map((g) => (
              <section key={g.title} className="spec-group" data-spec-in>
                <h3>{g.title}</h3>
                <ul>{g.items.map((i) => <li key={i}><Check />{i}</li>)}</ul>
              </section>
            ))}
          </div>
          <div className="spec-driver" data-spec-in>
            <h3>{spec.driver.title}</h3>
            <p>{spec.driver.text}</p>
          </div>
          <div className="spec-actions" data-spec-in>
            <a className="btn btn-dark" href="#rezerwacja" onClick={onReserve}>Zarezerwuj termin</a>
            <button type="button" className="btn btn-soft" onClick={onClose}>Wróć do floty</button>
          </div>
        </div>

        {/* Kopia zdjęcia, która przelatuje ze sceny do kafla (dekoracyjna — nazwa jest w nagłówku). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={clone} className="spec-car" src={car.image} alt="" width={1600} height={Math.round(1600 / car.ratio)} />
      </div>
    </div>
  );
}

function Check() {
  return <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m2.5 7.5 3 3 6-7" /></svg>;
}
