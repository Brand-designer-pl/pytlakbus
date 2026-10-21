'use client';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { booking, contact, fleet } from '@/content';
import { sendErrorText, sendForm } from '@/lib/sendForm';

type Props = { open: boolean; onClose: () => void; carId: string | null; getReturnFocus: () => HTMLElement | null };
type Errors = Partial<Record<'people' | 'duration' | 'date' | 'time' | 'name' | 'phone' | 'consent', string>>;

const reduceQuery = '(prefers-reduced-motion: reduce)';
const weekdays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const monthFmt = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' });
const longFmt = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
const times = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Rezerwacja w obrębie strony: najpierw telefon, potem krótki formularz z kalendarzem. */
export function BookingDialog({ open, onClose, carId, getReturnFocus }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const firstFocus = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const uid = useId();
  const startedAt = useRef(0);
  const [sendError, setSendError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [vehicle, setVehicle] = useState('any');
  const [people, setPeople] = useState(4);
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [route, setRoute] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Pojazd z miejsca, z którego otwarto rezerwację (np. panel V250d).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setVehicle(carId ?? 'any'); setStatus('idle'); setErrors({}); setSendError(''); }
  }

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const reduced = window.matchMedia(reduceQuery).matches;
    if (open) {
      document.documentElement.classList.add('booking-lock');
      gsap.set(root.current, { autoAlpha: 1 });
      panel.current!.scrollTop = 0;
      tl.current?.kill();
      tl.current = gsap.timeline({ defaults: { ease: 'power3.out' },
        onReverseComplete: () => {
          gsap.set(root.current, { autoAlpha: 0 });
          document.documentElement.classList.remove('booking-lock');
          getReturnFocus()?.focus({ preventScroll: true });
        } })
        .fromTo(q('.booking-backdrop'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0)
        .fromTo(panel.current, { xPercent: 104 }, { xPercent: 0, duration: 0.8, ease: 'power4.out' }, 0.05)
        .fromTo(q('[data-book-in]'), { opacity: 0, y: 24, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.05 }, 0.3);
      if (reduced) tl.current.progress(1);
      firstFocus.current?.focus({ preventScroll: true });
    } else if (tl.current && tl.current.progress() > 0) {
      if (reduced) tl.current.progress(0);
      else tl.current.timeScale(1.4).reverse();
    }
  }, { scope: root, dependencies: [open] });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);
  useEffect(() => () => document.documentElement.classList.remove('booking-lock'), []);
  useEffect(() => { if (open) startedAt.current = Date.now(); }, [open]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!(people >= 1 && people <= booking.maxPeople)) e.people = `Podaj liczbę osób od 1 do ${booking.maxPeople}.`;
    if (!duration) e.duration = 'Wybierz, jak długo potrzebujesz przewozu.';
    if (!date) e.date = 'Wybierz dzień w kalendarzu.';
    if (!time) e.time = 'Wybierz godzinę odbioru.';
    if (name.trim().length < 2) e.name = 'Podaj imię i nazwisko.';
    if (phone.replace(/\D/g, '').length < 9) e.phone = 'Podaj numer telefonu (min. 9 cyfr).';
    if (!consent) e.consent = 'Potrzebujemy zgody, żeby oddzwonić w sprawie rezerwacji.';
    return e;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      root.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    setStatus('sending');
    setSendError('');
    void sendForm({
      type: 'rezerwacja', website: honeypot, startedAt: startedAt.current,
      date: date ? `${longFmt.format(date)} (${iso(date)})` : '', time, people: String(people),
      duration: booking.durations.find((d) => d.id === duration)?.label ?? duration,
      vehicle: fleet.find((c) => c.id === vehicle)?.name ?? 'Dobierzcie pojazd do liczby osób',
      route, name, phone, email, notes, consent,
    }).then((result) => {
      if (result.ok) { setStatus('sent'); if (panel.current) panel.current.scrollTop = 0; return; }
      setStatus('idle');
      setSendError(sendErrorText[result.reason]);
    });
  };

  useGSAP(() => {
    if (status !== 'sent' || window.matchMedia(reduceQuery).matches) return;
    gsap.fromTo(gsap.utils.selector(root)('[data-sent-in]'), { opacity: 0, y: 20, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.07, ease: 'power3.out' });
  }, { scope: root, dependencies: [status] });

  const err = (k: keyof Errors) => errors[k] ? { 'aria-invalid': true, 'aria-describedby': `${uid}-${k}-err` } : {};
  const errorText = (k: keyof Errors) => errors[k] ? <p id={`${uid}-${k}-err`} className="field-error">{errors[k]}</p> : null;
  const carName = fleet.find((c) => c.id === vehicle)?.name ?? 'Dobierzemy pojazd';

  return (
    <div ref={root} className="booking" role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`} inert={!open}>
      <div className="booking-backdrop" onClick={onClose} />
      <div ref={panel} className="booking-panel">
        <div className="booking-head" data-book-in>
          <p id={`${uid}-title`} className="booking-title">Rezerwacja</p>
          <button type="button" className="booking-x" onClick={onClose} aria-label="Zamknij rezerwację">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6"><path d="M1 1l12 12M13 1 1 13" /></svg>
          </button>
        </div>

        {/* 1. Najszybciej: telefon */}
        {contact.phone ? (
          <a ref={firstFocus as React.RefObject<HTMLAnchorElement>} className="call-card" href={contact.phone.href} data-book-in>
            <span className="call-icon" aria-hidden="true"><PhoneIcon /></span>
            <span className="call-text">
              <span className="call-kicker">Najszybciej — zadzwoń</span>
              <span className="call-number">{contact.phone.display}</span>
              <span className="call-hours">{booking.hours}</span>
            </span>
            <span className="call-arrow" aria-hidden="true">→</span>
          </a>
        ) : (
          <div ref={firstFocus as React.RefObject<HTMLDivElement>} tabIndex={-1} className="call-card is-todo" data-book-in>
            <span className="call-icon" aria-hidden="true"><PhoneIcon /></span>
            <span className="call-text">
              <span className="call-kicker">Najszybciej — zadzwoń</span>
              <span className="todo">Numer telefonu — do uzupełnienia</span>
              <span className="call-hours">{booking.hours}</span>
            </span>
          </div>
        )}

        <div className="booking-divider" data-book-in><span>albo wyślij zgłoszenie, oddzwonimy</span></div>

        {status === 'sent' ? (
          <div className="booking-sent" role="status">
            <p className="booking-sent-title" data-sent-in>Dziękujemy, {name.split(' ')[0]}!</p>
            <p className="booking-sent-lead" data-sent-in>Oddzwonimy na numer {phone}, żeby potwierdzić termin.</p>
            <dl className="booking-summary" data-sent-in>
              <div><dt>Termin</dt><dd>{date && longFmt.format(date)}, {time}</dd></div>
              <div><dt>Osoby</dt><dd>{people}</dd></div>
              <div><dt>Czas</dt><dd>{booking.durations.find((d) => d.id === duration)?.label}</dd></div>
              <div><dt>Pojazd</dt><dd>{carName}</dd></div>
            </dl>
            <button type="button" className="btn btn-dark" onClick={onClose} data-sent-in>Zamknij</button>
          </div>
        ) : (
          <form className="booking-form" noValidate onSubmit={submit}>
            <div className="field" data-book-in>
              <label htmlFor={`${uid}-vehicle`}>Pojazd</label>
              <select id={`${uid}-vehicle`} value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                <option value="any">Dobierzcie pojazd do liczby osób</option>
                {fleet.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.seats} miejsc</option>)}
              </select>
            </div>

            <div className="field-row" data-book-in>
              <div className="field">
                <label htmlFor={`${uid}-people`}>Liczba osób</label>
                <div className="stepper">
                  <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="Mniej osób">−</button>
                  <input id={`${uid}-people`} data-field="people" type="number" inputMode="numeric" min={1} max={booking.maxPeople}
                    value={people} onChange={(e) => setPeople(Number(e.target.value))} {...err('people')} />
                  <button type="button" onClick={() => setPeople((p) => Math.min(booking.maxPeople, p + 1))} aria-label="Więcej osób">+</button>
                </div>
                {errorText('people')}
                {people > 22 && <p className="field-hint">Powyżej 22 osób dobierzemy kilka pojazdów.</p>}
              </div>
            </div>

            <fieldset className="field" data-book-in>
              <legend>Jak długo?</legend>
              <div className="chips" role="radiogroup" data-field="duration" tabIndex={-1} {...err('duration')}>
                {booking.durations.map((d) => (
                  <label key={d.id} className="chip">
                    <input type="radio" name={`${uid}-duration`} value={d.id} checked={duration === d.id} onChange={() => setDuration(d.id)} />
                    <span><strong>{d.label}</strong><small>{d.hint}</small></span>
                  </label>
                ))}
              </div>
              {errorText('duration')}
            </fieldset>

            <div className="field" data-book-in>
              <span className="label" id={`${uid}-date-label`}>Dzień</span>
              <Calendar value={date} onChange={setDate} labelledBy={`${uid}-date-label`} invalid={Boolean(errors.date)} describedBy={errors.date ? `${uid}-date-err` : undefined} />
              {errorText('date')}
            </div>

            <div className="field-row" data-book-in>
              <div className="field">
                <label htmlFor={`${uid}-time`}>Godzina odbioru</label>
                <select id={`${uid}-time`} data-field="time" value={time} onChange={(e) => setTime(e.target.value)} {...err('time')}>
                  <option value="" disabled>Wybierz</option>
                  {times.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errorText('time')}
              </div>
              <div className="field">
                <label htmlFor={`${uid}-route`}>Trasa <span className="optional">(opcjonalnie)</span></label>
                <input id={`${uid}-route`} type="text" placeholder="np. Puszczykowo → Lotnisko Ławica" value={route} onChange={(e) => setRoute(e.target.value)} />
              </div>
            </div>

            <div className="field-row" data-book-in>
              <div className="field">
                <label htmlFor={`${uid}-name`}>Imię i nazwisko</label>
                <input id={`${uid}-name`} data-field="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} {...err('name')} />
                {errorText('name')}
              </div>
              <div className="field">
                <label htmlFor={`${uid}-phone`}>Telefon</label>
                <input id={`${uid}-phone`} data-field="phone" type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} {...err('phone')} />
                {errorText('phone')}
              </div>
            </div>

            <div className="field" data-book-in>
              <label htmlFor={`${uid}-email`}>E-mail <span className="optional">(opcjonalnie)</span></label>
              <input id={`${uid}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field" data-book-in>
              <label htmlFor={`${uid}-notes`}>Uwagi <span className="optional">(opcjonalnie)</span></label>
              <textarea id={`${uid}-notes`} rows={3} placeholder="Bagaż, fotelik dla dziecka, przystanki…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="field" data-book-in>
              <label className="consent">
                <input data-field="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} {...err('consent')} />
                <span>Zgadzam się na kontakt telefoniczny lub e-mailowy w sprawie tej rezerwacji.</span>
              </label>
              {errorText('consent')}
            </div>

            {/* Pole-pułapka na boty — niewidoczne i pomijane przez czytniki ekranu. */}
            <input className="hp-field" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            {sendError && (
              <p className="send-error" role="alert">
                {sendError} {contact.phone && <>Zadzwoń: <a href={contact.phone.href}>{contact.phone.display}</a></>}
              </p>
            )}
            <div className="booking-actions" data-book-in>
              <button type="submit" className="btn btn-dark" disabled={status === 'sending'}>{status === 'sending' ? 'Wysyłanie…' : 'Wyślij zgłoszenie'}</button>
              {contact.phone && <a className="btn btn-soft" href={contact.phone.href}>Zadzwoń</a>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/** Kalendarz miesięczny: siatka przycisków z nawigacją strzałkami (roving tabindex). */
function Calendar({ value, onChange, labelledBy, invalid, describedBy }: { value: Date | null; onChange: (d: Date) => void; labelledBy: string; invalid: boolean; describedBy?: string }) {
  const [today] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [focusDay, setFocusDay] = useState<Date>(value ?? today);
  const grid = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);

  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // tydzień od poniedziałku
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    return [...Array<null>(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))];
  }, [view]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${iso(focusDay)}"]`)?.focus();
  }, [focusDay, view]);

  const goTo = (d: Date) => {
    const target = d < today ? today : d;
    moveFocus.current = true;
    setFocusDay(target);
    if (target.getMonth() !== view.getMonth() || target.getFullYear() !== view.getFullYear()) setView(new Date(target.getFullYear(), target.getMonth(), 1));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in step) { e.preventDefault(); goTo(new Date(focusDay.getFullYear(), focusDay.getMonth(), focusDay.getDate() + step[e.key])); }
    else if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); goTo(new Date(focusDay.getFullYear(), focusDay.getMonth() + (e.key === 'PageDown' ? 1 : -1), focusDay.getDate())); }
  };
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);
  const inView = focusDay.getMonth() === view.getMonth() && focusDay.getFullYear() === view.getFullYear();
  const tabbable = inView ? focusDay : (view.getMonth() === today.getMonth() ? today : new Date(view.getFullYear(), view.getMonth(), 1));

  return (
    <div className={`calendar${invalid ? ' is-invalid' : ''}`}>
      <div className="calendar-head">
        <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} disabled={!canPrev} aria-label="Poprzedni miesiąc">‹</button>
        <p aria-live="polite">{monthFmt.format(view)}</p>
        <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} aria-label="Następny miesiąc">›</button>
      </div>
      <div ref={grid} className="calendar-grid" role="group" data-field="date" tabIndex={-1} aria-labelledby={labelledBy} aria-describedby={describedBy} onKeyDown={onKey}>
        {weekdays.map((w) => <span key={w} className="calendar-wd" aria-hidden="true">{w}</span>)}
        {days.map((d, i) => d ? (
          <button key={i} type="button" data-day={iso(d)}
            className={`calendar-day${value && sameDay(d, value) ? ' is-selected' : ''}${sameDay(d, today) ? ' is-today' : ''}`}
            disabled={d < today} tabIndex={sameDay(d, tabbable) ? 0 : -1}
            aria-pressed={Boolean(value && sameDay(d, value))} aria-label={longFmt.format(d)}
            onClick={() => { onChange(d); setFocusDay(d); }}>
            {d.getDate()}
          </button>
        ) : <span key={i} />)}
      </div>
    </div>
  );
}

function PhoneIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
}
