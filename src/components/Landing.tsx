'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import { SplitText } from 'gsap/SplitText';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { gsap, ScrollTrigger, useGSAP, motionOK } from '@/lib/gsap';
import { observeLayout } from '@/lib/observeLayout';
import { brands, copy, featuredIndex, fleet } from '@/content';
import { SpecView } from '@/components/SpecView';
import { asset } from '@/lib/asset';
import { BookingDialog } from '@/components/BookingDialog';
import { HomeOffer } from '@/components/HomeOffer';
import { SiteFooter } from '@/components/SiteChrome';
import { MobileNav } from '@/components/MobileNav';

gsap.registerPlugin(SplitText, ScrollToPlugin);

// Momenty osi czasu sceny (jednostki timeline'u, nie sekundy).
// Bez martwych stref: każdy fragment scrolla porusza coś na ekranie (przystoje skrócone, w nich ciągły „dryf”).
// Tło (wideo) zaczyna się kurczyć od pierwszego piksela scrolla, równocześnie z wygaszaniem tekstu hero.
// Zasada: każde wejście/wyjście tekstu idzie w parze z ruchem obrazu lub tła (nigdy samo rozmycie).
const T = { heroOut: 0, morph1: 0.02, statementIn: 1.15, statementHold: 2.75, statementOut: 3.1, morph2: 3.1, fleetIn: 4.2, collectionHold: 5.55, collectionOut: 5.75, feature: 6.4, detail: 7.3, end: 8.15 };
// Etykiety etapów sceny (fokus klawiatury przewija do właściwego momentu).
const stops = { hero: 0, statement: T.statementHold, collection: T.collectionHold, detail: T.end };
// Czas, do którego przewijamy, gdy fokus klawiatury trafi do danej sceny.
const sceneFocusTime: Record<string, number> = { hero: stops.hero, statement: stops.statement, fleet: stops.detail };
// Kotwice menu → moment sceny (Flota = karuzela aut z panelem szczegółów).
const anchorTime: Record<string, number> = { start: stops.hero, 'o-nas': stops.statement, flota: stops.detail };
const reduceQuery = '(prefers-reduced-motion: reduce)';

function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let left = 0, top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) { left += node.offsetLeft; top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
  return { left, top, width: el.offsetWidth, height: el.offsetHeight };
}

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const userPaused = useRef(false);
  const syncVideos = useRef<(() => void) | null>(null);
  const swapDir = useRef(0);
  const goRef = useRef<((dir: 1 | -1) => void) | null>(null);
  const scrollToRef = useRef<((id: string) => void) | null>(null);
  const heroNextRef = useRef<(() => void) | null>(null);
  const [active, setActive] = useState(featuredIndex);
  const [paused, setPaused] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);
  const specButton = useRef<HTMLButtonElement>(null);
  const [booking, setBooking] = useState<{ open: boolean; carId: string | null }>({ open: false, carId: null });
  const bookingOpener = useRef<HTMLElement | null>(null);
  const car = fleet[active];

  useGSAP((_, contextSafe) => {
    const q = gsap.utils.selector(root);
    const stageEl = stage.current!;
    const header = q('.site-header')[0] as HTMLElement;
    const heroVideo = q('.morph-hero')[0] as HTMLVideoElement;
    const profileVideo = q('.morph-profile')[0] as HTMLVideoElement;
    const mm = gsap.matchMedia();

    // Przełączanie aut w panelu: wyjście w kierunku kliknięcia (wejście w hooku poniżej).
    goRef.current = contextSafe!((dir: 1 | -1) => {
      swapDir.current = dir;
      const step = () => setActive((a) => (a + dir + fleet.length) % fleet.length);
      if (window.matchMedia(reduceQuery).matches) { step(); return; }
      gsap.to(q('[data-swap]'), { x: -dir * 60, opacity: 0, filter: 'blur(8px)', duration: 0.3, ease: 'power2.in', overwrite: true, onComplete: step });
    });

    // hero-reveal (adaptacja): wejście z rozmyciem, tylko przy zgodzie na ruch.
    mm.add(motionOK, () => {
      const title = SplitText.create(q('[data-intro="title"]'), { type: 'words', wordsClass: 'intro-word' });
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      // fromTo z jawnymi wartościami końcowymi: wejście nie zależy od stanu zastanego (StrictMode/HMR).
      const shown = { opacity: 1, filter: 'blur(0px)', y: 0, clearProps: 'opacity,filter,transform' };
      intro
        .fromTo(title.words, { opacity: 0, filter: 'blur(18px)' }, { ...shown, duration: 1.2, stagger: 0.14 }, 0)
        .fromTo(q('[data-intro="nav"]'), { opacity: 0, filter: 'blur(8px)', y: -6 }, { ...shown, duration: 0.6, stagger: 0.07 }, 0.1)
        .fromTo(q('[data-intro="cta"]'), { opacity: 0, backgroundColor: '#3a3a3a' }, { opacity: 1, backgroundColor: '#ffffff', duration: 0.7, clearProps: 'opacity,backgroundColor' }, 0.35)
        .fromTo(q('[data-intro="lead"]'), { opacity: 0, filter: 'blur(12px)', y: 12 }, { ...shown, duration: 0.8, stagger: 0.12 }, 0.5)
        .fromTo(heroVideo, { opacity: 0.35, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out', clearProps: 'opacity,transform' }, 0);
      return () => { intro.revert(); title.revert(); };
    });

    // Pinowana scena (adaptacja pinned-panels + split-heading, scrub jednej osi czasu).
    mm.add(motionOK, () => {
      stageEl.classList.add('is-staged');
      const statementSplit = SplitText.create(q('.statement-text'), { type: 'words', wordsClass: 'st-word' });
      const collectionSplit = SplitText.create(q('.collection-text'), { type: 'words', wordsClass: 'col-word' });

      const lite = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
      const blur = (px: number) => (lite ? {} : { filter: `blur(${px}px)` });
      const g = { vw: 0, vh: 0, iw: 0, ih: 0, gap: 0, xStart: 0, yStart: 0, yMid: 0, scale: 1, mobile: false };
      const measure = () => {
        g.vw = stageEl.clientWidth; g.vh = stageEl.clientHeight; g.mobile = g.vw < 768;
        g.iw = g.mobile ? g.vw * 0.62 : Math.min(Math.max(g.vw * 0.24, 260), 480);
        g.ih = g.iw * 0.62;
        g.gap = g.vw * (g.mobile ? 0.06 : 0.035);
        g.xStart = (g.iw + g.gap) * 0.45;
        g.yStart = g.vh * (g.mobile ? 0.3 : 0.36);
        g.yMid = g.vh * (g.mobile ? 0.22 : 0.25); // rząd pod tekstem kolekcji na przystanku
        g.scale = (g.mobile ? g.vw * 0.94 : Math.min(g.vw * 0.7, 1150)) / (g.iw * 0.88 * fleet[featuredIndex].size);
        stageEl.style.setProperty('--iw', `${g.iw}px`);
        stageEl.style.setProperty('--ih', `${g.ih}px`);
        stageEl.style.setProperty('--gap', `${g.gap}px`);
      };
      measure();
      ScrollTrigger.addEventListener('refreshInit', measure);
      const cardSlot = () => offsetWithin(q('.slot-card')[0] as HTMLElement, stageEl);
      const fleetSlot = () => ({ left: g.vw / 2 - g.iw / 2 + g.xStart, top: g.vh / 2 - g.ih / 2 + g.yStart, width: g.iw, height: g.ih });

      const morph = q('.morph')[0];
      const items = q('.fleet-item') as HTMLElement[];
      const center = items[featuredIndex];
      const left = items.slice(0, featuredIndex);
      const right = items.slice(featuredIndex + 1);
      const others = [...left, ...right];

      let heroPlaying = false, profilePlaying = false;
      const playState = (video: HTMLVideoElement, on: boolean) => {
        if (on) void video.play().catch(() => {}); else video.pause();
      };
      const sync = (time: number) => {
        const wantHero = !userPaused.current && time < T.morph1 + 1.3;
        const wantProfile = !userPaused.current && time > T.morph1 + 0.6 && time < T.fleetIn;
        if (wantHero !== heroPlaying) { heroPlaying = wantHero; playState(heroVideo, wantHero); }
        if (wantProfile !== profilePlaying) { profilePlaying = wantProfile; playState(profileVideo, wantProfile); }
        stageEl.dataset.scene = time < T.morph1 ? 'hero' : time < T.morph2 ? 'statement' : time > T.detail ? 'detail' : 'fleet';
      };

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stageEl, start: 'top top', end: () => '+=' + Math.round(stageEl.clientHeight * 7),
          // Ciągłe, natywne przewijanie; scrub 0.6 — ruch od razu po każdym scrollu, nadal wygładzony.
          pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: (self) => sync(self.progress * tl.duration()),
          onRefresh: (self) => sync(self.progress * tl.duration()),
        },
      });
      timeline.current = tl;
      Object.entries(stops).forEach(([name, time]) => tl.addLabel(name, time));
      const yFor = (t: number) => { const st = tl.scrollTrigger!; return Math.min(st.end - 1, st.start + (t / tl.duration()) * (st.end - st.start)); };
      // Menu: płynny przejazd do etapu sceny — po drodze odtwarzają się wszystkie animacje; ruch kółkiem przerywa.
      scrollToRef.current = contextSafe!((id: string) => {
        const y = yFor(anchorTime[id] ?? 0);
        gsap.to(window, { scrollTo: { y, autoKill: true }, duration: gsap.utils.clamp(0.8, 3, Math.abs(y - window.scrollY) / 2600), ease: 'power2.inOut' });
      });
      // Hero → kolejna sekcja: pierwszy ruch w dół z hero odtwarza pełne przejście do manifestu.
      // Dalej przewijanie jest zwykłe i ciągłe; auto-przejście wraca tylko po powrocie na sam początek (hero).
      let heroBusy = false;
      const inHero = () => ((window.scrollY - tl.scrollTrigger!.start) / (tl.scrollTrigger!.end - tl.scrollTrigger!.start)) * tl.duration() < 0.2;
      const modalOpen = () => document.documentElement.classList.contains('spec-lock') || document.documentElement.classList.contains('booking-lock');
      const heroNext = contextSafe!(() => {
        if (heroBusy) return;
        heroBusy = true;
        gsap.to(window, { scrollTo: { y: yFor(stops.statement), autoKill: false }, duration: 1.8, ease: 'power2.inOut',
          onComplete: () => { window.setTimeout(() => { heroBusy = false; }, 250); } }); // wygaszenie bezwładności touchpada
      });
      heroNextRef.current = heroNext;
      const onWheel = (e: WheelEvent) => {
        if (heroBusy) { e.preventDefault(); return; } // w trakcie przejścia kółko nie szarpie sceną
        if (e.deltaY > 0 && !e.ctrlKey && inHero() && !modalOpen()) { e.preventDefault(); heroNext(); }
      };
      let touchY = 0;
      const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
      const onTouchMove = (e: TouchEvent) => {
        if (heroBusy) { e.preventDefault(); return; }
        if (touchY - e.touches[0].clientY > 12 && inHero() && !modalOpen()) { e.preventDefault(); heroNext(); }
      };
      const onHeroKey = (e: KeyboardEvent) => {
        if (!inHero() || modalOpen() || e.altKey || e.ctrlKey || e.metaKey) return;
        if ((e.target as HTMLElement).closest('input, textarea, select, button, [contenteditable="true"]') && e.key === ' ') return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) { e.preventDefault(); heroNext(); }
      };
      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('keydown', onHeroKey);

      // Wejście z innej strony z kotwicą (np. /#flota z podstrony Kontakt).
      // Odczyt z opóźnieniem: przy nawigacji klienckiej Next.js adres i jego własny scroll do kotwicy przychodzą po montażu.
      const hashFrame = window.setTimeout(() => {
        const t = anchorTime[window.location.hash.slice(1)];
        if (t === undefined || t === 0) return;
        ScrollTrigger.refresh();
        window.scrollTo(0, yFor(t));
      }, 150);
      syncVideos.current = () => sync(tl.scrollTrigger!.progress * tl.duration());
      // Tylko w dev: podgląd dowolnej klatki sceny (np. __avelonSeek(7.4)).
      if (process.env.NODE_ENV !== 'production') {
        (window as unknown as { __avelonSeek?: (t: number) => void }).__avelonSeek = (t) => {
          const st = tl.scrollTrigger!;
          window.scrollTo(0, st.start + (t / tl.duration()) * (st.end - st.start));
          st.update(); tl.time(t, false);
        };
        Object.assign(window, { __avelonTl: tl, __gsap: gsap });
      }

      // 1. Hero → wyjście treści z rozmyciem.
      tl.to(q('.scene-hero'), { '--scrim': 0, duration: 0.6 }, T.heroOut)
        .to(q('.hero-title'), { opacity: 0, ...blur(16), y: -24, duration: 0.7, ease: 'power1.in' }, T.heroOut + 0.05)
        .to(q('.hero-lead, .hero-meta'), { opacity: 0, ...blur(10), duration: 0.6, stagger: 0.06, ease: 'power1.in' }, T.heroOut)
        // 2. Pełnoekranowe wideo kurczy się do zaokrąglonej karty.
        .fromTo(morph,
          { left: 0, top: 0, width: () => g.vw, height: () => g.vh, borderRadius: 0 },
          { left: () => cardSlot().left, top: () => cardSlot().top, width: () => cardSlot().width, height: () => cardSlot().height,
            borderRadius: () => (g.mobile ? 16 : 22), duration: 1.2, ease: 'power2.out' }, T.morph1) // szybki start: ruch od pierwszego scrolla
        .fromTo(heroVideo, { scale: 1 }, { scale: 1.12, duration: 1.2, ease: 'power1.inOut', immediateRender: false }, T.morph1)
        .to(header, { '--nav-fg': '#0b0b0b', '--nav-muted': '#9a9a9a', '--btn-bg': '#0b0b0b', '--btn-fg': '#ffffff', duration: 0.35 }, T.morph1 + 0.15)
        .to(profileVideo, { opacity: 1, duration: 0.45 }, T.morph1 + 0.85)
        // 3. Manifest: słowa wyostrzają się kolejno, marquee marek jedzie ze scrollem.
        .fromTo(statementSplit.words, { opacity: 0, ...blur(12), yPercent: 45 },
          { opacity: 1, ...blur(0), yPercent: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' }, T.statementIn)
        .fromTo(q('.statement-cta'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, T.statementIn + 1.0)
        .fromTo(q('.brand-marquee'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, T.statementIn + 0.3)
        .fromTo(q('.brand-track'), { xPercent: 0 }, { xPercent: -25, duration: 3 }, T.statementIn - 0.1)
        .to(statementSplit.words, { opacity: 0, ...blur(12), duration: 0.4, stagger: 0.012, ease: 'power1.in' }, T.statementOut)
        .to(q('.statement-cta, .brand-marquee'), { opacity: 0, duration: 0.3 }, T.statementOut)
        // 4. Karta zjeżdża w dół i staje się szarym kafelkiem floty.
        .to(morph, { left: () => fleetSlot().left, top: () => fleetSlot().top, width: () => fleetSlot().width, height: () => fleetSlot().height,
          borderRadius: 12, duration: 1.1, ease: 'power2.inOut' }, T.morph2)
        .fromTo(q('.morph-veil'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, T.morph2 + 0.55)
        .fromTo(center.querySelector('.car'), { opacity: 0, ...blur(10) }, { opacity: 1, ...blur(0), duration: 0.4 }, T.fleetIn - 0.1)
        .to(morph, { opacity: 0, duration: 0.35 }, T.fleetIn + 0.2)
        .fromTo(others, { opacity: 0, ...blur(14) }, { opacity: 1, ...blur(0), duration: 0.5, stagger: { each: 0.06, from: 'center' } }, T.fleetIn)
        // 5. Rząd aut wjeżdża przez tekst kolekcji.
        .fromTo(q('.fleet-row'), { x: () => g.xStart }, { x: 0, duration: T.feature - T.fleetIn, ease: 'power1.inOut' }, T.fleetIn)
        .fromTo(q('.fleet-row'), { y: () => g.yStart }, { y: () => g.yMid, duration: T.collectionHold - T.fleetIn, ease: 'power2.out' }, T.fleetIn)
        .to(q('.fleet-row'), { y: 0, duration: T.feature - T.collectionOut, ease: 'power2.inOut' }, T.collectionOut)
        .fromTo(collectionSplit.words, { opacity: 0, ...blur(10) }, { opacity: 1, ...blur(0), duration: 0.35, stagger: 0.035 }, T.fleetIn + 0.2)
        .to(collectionSplit.words, { opacity: 0, ...blur(12), duration: 0.4, stagger: 0.008, ease: 'power1.in' }, T.collectionOut)
        // 6. Wybrane auto rośnie do centrum, sąsiedzi odjeżdżają rozmyci.
        .to(center, { scale: () => g.scale, y: () => -g.vh * (g.mobile ? 0.1 : 0.06), duration: 1, ease: 'power2.inOut' }, T.feature)
        .to(left, { x: () => -g.vw * 0.28, opacity: 0, ...blur(16), duration: 0.9, ease: 'power2.in' }, T.feature)
        .to(right, { x: () => g.vw * 0.28, opacity: 0, ...blur(16), duration: 0.9, ease: 'power2.in' }, T.feature)
        // 7. Panel szczegółów wjeżdża kafelkami.
        .fromTo(q('.detail-item'), { opacity: 0, y: 40, ...blur(6) },
          { opacity: 1, y: 0, ...blur(0), duration: 0.5, stagger: 0.08, ease: 'power2.out' }, T.detail)
        // 8. Ciągły dryf wypełniający przystoje: wideo w karcie powoli się przybliża, teksty lekko płyną.
        .fromTo(q('.morph-profile'), { scale: 1.24, xPercent: -4 }, { scale: 1, xPercent: 4, duration: T.morph2 + 0.6 - (T.morph1 + 0.5), ease: 'none' }, T.morph1 + 0.5)
        .fromTo(q('.statement'), { y: 40 }, { y: -40, duration: T.morph2 - T.statementIn, ease: 'none' }, T.statementIn)
        .fromTo(q('.collection-text'), { yPercent: -54 }, { yPercent: -70, duration: T.feature - T.fleetIn, ease: 'none' }, T.fleetIn)
        .fromTo(center.querySelector('.car'), { y: 0, scale: 1 }, { y: () => -g.vh * 0.035, scale: 1.05, duration: T.end - T.detail + 0.1, ease: 'power1.out' }, T.detail - 0.1)
        .to({}, { duration: 0.1 }, T.end - 0.1);

      const stopObserving = observeLayout(stageEl);
      const onVisibility = contextSafe!(() => { if (document.hidden) { heroVideo.pause(); profileVideo.pause(); heroPlaying = profilePlaying = false; } else sync(tl.scrollTrigger!.progress * tl.duration()); });
      document.addEventListener('visibilitychange', onVisibility);
      userPaused.current = false;
      setPaused(false);
      syncVideos.current();

      return () => {
        document.removeEventListener('visibilitychange', onVisibility);
        ScrollTrigger.removeEventListener('refreshInit', measure);
        stopObserving();
        timeline.current = null;
        scrollToRef.current = null;
        window.clearTimeout(hashFrame);
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('keydown', onHeroKey);
        heroNextRef.current = null;
        syncVideos.current = null;
        statementSplit.revert();
        collectionSplit.revert();
        heroVideo.pause(); profileVideo.pause();
        stageEl.classList.remove('is-staged');
        delete stageEl.dataset.scene;
        ['--iw', '--ih', '--gap'].forEach((p) => stageEl.style.removeProperty(p));
      };
    });

    // Bez animacji: zwykły układ sekcji, nagłówek jasnieje po zejściu z hero.
    mm.add(reduceQuery, () => {
      userPaused.current = true;
      setPaused(true);
      ScrollTrigger.create({ trigger: q('.scene-hero')[0], start: 'bottom top+=72', end: 'max', toggleClass: { targets: header, className: 'is-light' } });
    });
    // Poniżej sceny (sekcja oferty, stopka) nagłówek dostaje jasne tło, żeby nie nachodził na tekst.
    ScrollTrigger.create({ trigger: q('.home-offer')[0], start: 'top top+=80', end: 'max', toggleClass: { targets: header, className: 'is-solid' } });

    return () => { mm.revert(); goRef.current = null; };
  }, { scope: root });

  // Zmiana auta w panelu: wyjście w kierunku kliknięcia, wejście z drugiej strony.
  useGSAP(() => {
    if (!swapDir.current || window.matchMedia(reduceQuery).matches) return;
    gsap.fromTo(root.current!.querySelectorAll('[data-swap]'), { x: swapDir.current * 60, opacity: 0, filter: 'blur(8px)' },
      { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out', stagger: 0.03, clearProps: 'transform,opacity,filter' });
  }, { scope: root, dependencies: [active] });

  // Specyfikacja w obrębie strony: wpis w historii (#specyfikacja-…), „Wstecz” zamyka widok.
  const specHash = `#specyfikacja-${car.id}`;
  const openSpec = () => {
    window.history.pushState({ spec: car.id }, '', specHash);
    setSpecOpen(true);
  };
  const closeSpec = useCallback(() => {
    if (window.history.state?.spec) window.history.back(); // popstate zamknie widok
    else setSpecOpen(false);
  }, []);
  // Rezerwacja: kolejny wpis w historii (#rezerwacja); zachowuje otwartą specyfikację pod spodem.
  const openBooking = (event: React.MouseEvent<HTMLElement>, carId: string | null = null) => {
    event.preventDefault();
    bookingOpener.current = event.currentTarget;
    const state = window.history.state?.spec ? { spec: window.history.state.spec, booking: true } : { booking: true };
    window.history.pushState(state, '', '#rezerwacja');
    setBooking({ open: true, carId });
  };
  const closeBooking = useCallback(() => {
    if (window.history.state?.booking) window.history.back();
    else setBooking((b) => ({ ...b, open: false }));
  }, []);
  useEffect(() => {
    const onPop = () => {
      setSpecOpen(Boolean(window.history.state?.spec));
      setBooking((b) => ({ ...b, open: Boolean(window.history.state?.booking) }));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // „Przewiń”: pełne przejście do kolejnej sekcji (bez sceny — zwykły skok do sekcji „O nas”).
  const goToNextSection = () => {
    if (heroNextRef.current) { heroNextRef.current(); return; }
    document.getElementById('o-nas')?.scrollIntoView({ behavior: window.matchMedia(reduceQuery).matches ? 'auto' : 'smooth' });
  };

  const goToAnchor = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!scrollToRef.current) return; // bez sceny (reduced motion / bez JS) działa zwykła kotwica
    event.preventDefault();
    window.history.replaceState(window.history.state, '', id === 'start' ? window.location.pathname : `#${id}`);
    scrollToRef.current(id);
  };

  // Wejście z adresem /#rezerwacja (np. przycisk „Zarezerwuj” na podstronie Kontakt) otwiera rezerwację.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const m = window.location.hash.match(/^#rezerwacja(?:-([a-z0-9]+))?$/);
      if (!m) return;
      const carId = m[1] && fleet.some((c) => c.id === m[1]) ? m[1] : null;
      window.history.replaceState({ booking: true }, '', window.location.hash);
      setBooking({ open: true, carId });
    }, 150);
    return () => window.clearTimeout(timer);
  }, []);

  const togglePause = () => {
    const next = !paused;
    userPaused.current = next;
    setPaused(next);
    if (syncVideos.current) { syncVideos.current(); return; }
    // Tryb ograniczonego ruchu: film startuje wyłącznie na żądanie.
    const hero = root.current!.querySelector<HTMLVideoElement>('.morph-hero')!;
    if (next) hero.pause(); else void hero.play().catch(() => {});
  };

  // Fokus klawiatury w ukrytej scenie przewija do momentu, w którym jest widoczna.
  const onFocusCapture = (event: FocusEvent<HTMLElement>) => {
    const tl = timeline.current;
    const st = tl?.scrollTrigger;
    const scene = (event.target as HTMLElement).closest<HTMLElement>('[data-scene-id]')?.dataset.sceneId;
    if (!tl || !st || !scene) return;
    const time = sceneFocusTime[scene];
    const current = st.progress * tl.duration();
    if (Math.abs(current - time) < 0.4) return;
    window.scrollTo({ top: st.start + (time / tl.duration()) * (st.end - st.start), behavior: 'instant' });
  };

  return (
    <>
    <div ref={root} className="site" inert={booking.open}>
      <header className="site-header">
        <Link className="logo" href="/" data-intro="nav" aria-label="PytlakBus — strona główna" onClick={(e) => goToAnchor(e, 'start')}>
          <span className="logo-img" aria-hidden="true" />
        </Link>
        <nav aria-label="Menu główne">
          <ul className="nav-links">
            <li><Link href="/" className="is-current" data-intro="nav" aria-current="page" onClick={(e) => goToAnchor(e, 'start')}>Start</Link></li>
            <li><Link href="/oferta/" data-intro="nav">Oferta</Link></li>
            {/* Na stronie głównej „Flota” przewija do karuzeli (prośba klienta); bez sceny prowadzi do podstrony /flota/. */}
            <li><Link href="/flota/" data-intro="nav" onClick={(e) => goToAnchor(e, 'flota')}>Flota</Link></li>
            <li><Link href="/o-nas/" data-intro="nav">O nas</Link></li>
            <li><Link href="/kontakt/" data-intro="nav">Kontakt</Link></li>
          </ul>
        </nav>
        <a className="btn btn-nav" href="#rezerwacja" data-intro="cta" onClick={(e) => openBooking(e)}>Zarezerwuj</a>
        <MobileNav current="/" onReserve={(e) => openBooking(e)} />
      </header>

      <main id="main" ref={stage} className="stage" onFocusCapture={onFocusCapture}>
        <div className="morph" aria-hidden="true">
          <video className="morph-hero" muted loop playsInline preload="auto" poster={asset('/media/hero-poster.webp')}>
            <source src={asset('/media/hero.mp4')} type="video/mp4" />
          </video>
          <video className="morph-profile" muted loop playsInline preload="metadata" poster={asset('/media/profile-poster.webp')}>
            <source src={asset('/media/profile.mp4')} type="video/mp4" />
          </video>
          <div className="morph-veil" />
        </div>

        <section id="start" className="scene scene-hero" data-scene-id="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            <span className="t-premium" data-intro="title">{copy.titleMuted}</span>{' '}
            <span className="t-rental" data-intro="title">{copy.titleLines[0]}<br />{copy.titleLines[1]}</span>
          </h1>
          <div className="hero-lead">
            <p className="pill pill-dark" data-intro="lead"><PinIcon />{copy.city}</p>
            <p className="lead" data-intro="lead">{copy.heroLead}</p>
          </div>
          <div className="hero-meta">
            <button type="button" className="scroll-hint" data-intro="lead" onClick={goToNextSection}>Przewiń <ArrowDown /></button>
            <button type="button" className="film-toggle" data-intro="lead" onClick={togglePause} aria-pressed={paused}>
              {paused ? 'Odtwórz film' : 'Zatrzymaj film'}
            </button>
          </div>
        </section>

        <section id="o-nas" className="scene scene-statement" data-scene-id="statement" aria-label="O nas">
          <div className="slot-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/media/profile-poster.webp')} alt="" width={1400} height={1045} />
          </div>
          <div className="statement">
            <p className="statement-text">
              {copy.statement.map((line) => <span className="statement-line" key={line}>{line} </span>)}
            </p>
            <a className="btn btn-soft statement-cta" href="#rezerwacja" onClick={(e) => openBooking(e)}>Zarezerwuj termin</a>
          </div>
          <div className="brand-marquee" aria-label="Nasze wartości">
            <ul className="brand-track">
              {[...brands, ...brands].map((b, i) => <li key={i} aria-hidden={i >= brands.length || undefined}>{b}</li>)}
            </ul>
          </div>
        </section>

        <section id="flota" className="scene scene-fleet" data-scene-id="fleet" aria-label="Flota">
          <p className="collection-text">{copy.collection}</p>
          <ul className="fleet-row">
            {fleet.map((c, i) => {
              const shown = i === featuredIndex ? car : c;
              return (
                <li className={`fleet-item${i === featuredIndex ? ' is-center' : ''}`} key={c.id} style={{ '--i': i - featuredIndex, '--s': c.size } as React.CSSProperties}>
                  <div className="car">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img data-swap={i === featuredIndex ? '' : undefined} src={shown.image} alt={shown.name} width={1600} height={Math.round(1600 / shown.ratio)} loading="lazy" decoding="async" />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="detail-bar">
            <button type="button" className="detail-item detail-nav" onClick={() => goRef.current?.(-1)} aria-label="Poprzedni pojazd"><Chevron dir="left" /></button>
            <div className="detail-item detail-name">
              <h2 data-swap="">{car.name}</h2>
              <p data-swap="">{car.blurb}</p>
              {car.spec
                ? <button ref={specButton} type="button" className="btn btn-muted" onClick={openSpec} aria-haspopup="dialog" aria-expanded={specOpen}>Specyfikacja</button>
                : <Link className="btn btn-muted" href="/kontakt">Specyfikacja</Link>}
            </div>
            <div className="detail-item detail-where">
              <span className="pill" data-swap="">{car.luggage}</span>
              <span className="pill" data-swap="">{car.extra}</span>
            </div>
            <div className="detail-item detail-price">
              <span className="muted">Miejsca</span>
              <strong data-swap="">{car.seats}</strong>
              <a className="btn btn-dark" href="#rezerwacja" onClick={(e) => openBooking(e, car.id)}>Zarezerwuj</a>
            </div>
            <button type="button" className="detail-item detail-nav" onClick={() => goRef.current?.(1)} aria-label="Następny pojazd"><Chevron dir="right" /></button>
            <p className="sr-only" aria-live="polite">{car.name}, miejsca: {car.seats}</p>
          </div>
        </section>
      </main>

      <SpecView
        car={car}
        open={specOpen}
        onClose={closeSpec}
        getSource={() => root.current?.querySelector<HTMLElement>('.is-center img') ?? null}
        getHidden={() => (root.current ? [...root.current.querySelectorAll('.detail-bar .detail-item')] : [])}
        getStage={() => stage.current}
        getReturnFocus={() => specButton.current}
        onReserve={(e) => openBooking(e, car.id)}
      />

      <HomeOffer />

      <SiteFooter onReserve={(e) => openBooking(e)} />
    </div>
    <BookingDialog open={booking.open} carId={booking.carId} onClose={closeBooking} getReturnFocus={() => bookingOpener.current} />
    </>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
      <path d="M7 0a6 6 0 0 0-6 6c0 4.2 5.1 9.3 5.4 9.6a.8.8 0 0 0 1.2 0C7.9 15.3 13 10.2 13 6a6 6 0 0 0-6-6Zm0 8.3A2.3 2.3 0 1 1 7 3.7a2.3 2.3 0 0 1 0 4.6Z" />
    </svg>
  );
}
function ArrowDown() {
  return <svg aria-hidden="true" width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 1v13M1 9l5 5 5-5" /></svg>;
}
function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return <svg aria-hidden="true" width="12" height="22" viewBox="0 0 12 22" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={dir === 'left' ? 'M11 1 1 11l10 10' : 'm1 1 10 10L1 21'} /></svg>;
}
