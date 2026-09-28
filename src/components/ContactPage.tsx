'use client';
import Link from 'next/link';
import { useId, useRef, useState, type FormEvent } from 'react';
import { gsap, useGSAP, motionOK } from '@/lib/gsap';
import { contact, copy } from '@/content';

type Errors = Partial<Record<'name' | 'reach' | 'message' | 'consent', string>>;
const topics = ['Rezerwacja przewozu', 'Wycena przejazdu', 'Współpraca z firmą / instytucją', 'Inne'];

/** Podstrona Kontakt: dane kontaktowe (puste pola oznaczone „do uzupełnienia”) + formularz. */
export function ContactPage() {
  const root = useRef<HTMLDivElement>(null);
  const uid = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Wejście jak na stronie głównej: rozmyte elementy wyostrzają się kaskadowo.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(motionOK, () => {
      gsap.fromTo(gsap.utils.selector(root)('[data-in]'), { opacity: 0, y: 24, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.07, ease: 'power3.out', clearProps: 'opacity,transform,filter' });
    });
    return () => mm.revert();
  }, { scope: root });

  useGSAP(() => {
    if (status !== 'sent' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(gsap.utils.selector(root)('[data-sent-in]'), { opacity: 0, y: 16, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.07, ease: 'power3.out' });
  }, { scope: root, dependencies: [status] });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Podaj imię i nazwisko.';
    if (phone.replace(/\D/g, '').length < 9 && !/^\S+@\S+\.\S+$/.test(email)) e.reach = 'Podaj telefon (min. 9 cyfr) lub poprawny e-mail — jedno wystarczy.';
    if (message.trim().length < 5) e.message = 'Napisz, w czym możemy pomóc.';
    if (!consent) e.consent = 'Potrzebujemy zgody, żeby odpowiedzieć na wiadomość.';
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) { root.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus(); return; }
    setStatus('sending');
    // TODO: podłączyć wysyłkę (endpoint / e-mail firmy). Na razie tylko potwierdzenie w interfejsie.
    window.setTimeout(() => setStatus('sent'), 700);
  };

  const err = (k: keyof Errors) => errors[k] ? { 'aria-invalid': true, 'aria-describedby': `${uid}-${k}-err` } : {};
  const errorText = (k: keyof Errors) => errors[k] ? <p id={`${uid}-${k}-err`} className="field-error">{errors[k]}</p> : null;
  const todo = (what: string) => <span className="todo">{what} — do uzupełnienia</span>;

  return (
    <div ref={root} className="contact-page">
      <header className="site-header is-light">
        <Link className="logo" href="/" aria-label="PytlakBus — strona główna"><span className="logo-img" aria-hidden="true" /></Link>
        <nav aria-label="Menu główne">
          <ul className="nav-links">
            <li><Link href="/#start">Start</Link></li>
            <li><Link href="/#flota">Flota</Link></li>
            <li><Link href="/#o-nas">O nas</Link></li>
            <li><Link href="/kontakt" className="is-current" aria-current="page">Kontakt</Link></li>
          </ul>
        </nav>
        <Link className="btn btn-nav" href="/#rezerwacja">Zarezerwuj</Link>
      </header>

      <main id="main" className="contact-main">
        <section className="contact-hero" aria-labelledby={`${uid}-title`}>
          <p className="contact-kicker" data-in>Kontakt</p>
          <h1 id={`${uid}-title`} className="contact-title" data-in>Porozmawiajmy<br />o Twoim przewozie.</h1>
          <p className="contact-lead" data-in>Działamy {contact.hours}. Zadzwoń albo napisz — odpowiemy i dobierzemy pojazd do liczby osób i trasy.</p>
        </section>

        <div className="contact-grid">
          <section className="contact-info" aria-label="Dane kontaktowe">
            <div className="info-card info-card--dark" data-in>
              <p className="info-label">Telefon</p>
              {contact.phone ? <a className="info-value" href={contact.phone.href}>{contact.phone.display}</a> : todo('Numer telefonu')}
              <p className="info-note">{contact.hours}</p>
            </div>
            <div className="info-card" data-in>
              <p className="info-label">E-mail</p>
              {contact.email ? <a className="info-value" href={`mailto:${contact.email}`}>{contact.email}</a> : todo('Adres e-mail')}
            </div>
            <div className="info-card" data-in>
              <p className="info-label">Lokalizacja</p>
              {contact.address ? <p className="info-value">{contact.address}</p> : todo('Adres (ulica, kod, miasto)')}
              <p className="info-note">Siedziba: {copy.city}</p>
            </div>
            <div className="info-card info-map" data-in>
              {contact.mapUrl
                ? <a className="btn btn-dark" href={contact.mapUrl} target="_blank" rel="noopener noreferrer">Otwórz w Mapach Google</a>
                : <>{todo('Mapa dojazdu')}<p className="info-note">Pojawi się po podaniu adresu.</p></>}
            </div>
          </section>

          <section className="contact-form-card" aria-labelledby={`${uid}-form`} data-in>
            {status === 'sent' ? (
              <div className="booking-sent" role="status">
                <p className="booking-sent-title" data-sent-in>Dziękujemy, {name.split(' ')[0]}!</p>
                <p className="booking-sent-lead" data-sent-in>Wiadomość dotarła. Odezwiemy się {phone ? `na numer ${phone}` : `na adres ${email}`}.</p>
                <button type="button" className="btn btn-soft" data-sent-in onClick={() => { setStatus('idle'); setMessage(''); }}>Napisz kolejną wiadomość</button>
              </div>
            ) : (
              <form className="booking-form" noValidate onSubmit={submit}>
                <h2 id={`${uid}-form`} className="contact-form-title">Napisz do nas</h2>
                <div className="field">
                  <label htmlFor={`${uid}-name`}>Imię i nazwisko</label>
                  <input id={`${uid}-name`} data-field="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} {...err('name')} />
                  {errorText('name')}
                </div>
                <fieldset className="field">
                  <legend>Jak się z Tobą skontaktować? <span className="optional">(telefon lub e-mail)</span></legend>
                  <div className="field-row">
                    <input aria-label="Telefon" data-field="reach" type="tel" inputMode="tel" autoComplete="tel" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} {...err('reach')} />
                    <input aria-label="E-mail" type="email" autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} {...err('reach')} />
                  </div>
                  {errorText('reach')}
                </fieldset>
                <div className="field">
                  <label htmlFor={`${uid}-topic`}>Temat</label>
                  <select id={`${uid}-topic`} value={topic} onChange={(e) => setTopic(e.target.value)}>
                    {topics.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor={`${uid}-msg`}>Wiadomość</label>
                  <textarea id={`${uid}-msg`} data-field="message" rows={5} placeholder="Termin, trasa, liczba osób…" value={message} onChange={(e) => setMessage(e.target.value)} {...err('message')} />
                  {errorText('message')}
                </div>
                <div className="field">
                  <label className="consent">
                    <input data-field="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} {...err('consent')} />
                    <span>Zgadzam się na kontakt w sprawie mojej wiadomości.</span>
                  </label>
                  {errorText('consent')}
                </div>
                <div className="booking-actions">
                  <button type="submit" className="btn btn-dark" disabled={status === 'sending'}>{status === 'sending' ? 'Wysyłanie…' : 'Wyślij wiadomość'}</button>
                  <Link className="btn btn-soft" href="/#rezerwacja">Zarezerwuj przewóz</Link>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>

      <footer className="site-footer site-footer--compact">
        <p className="footer-legal muted">© {new Date().getFullYear()} PytlakBus · {copy.city}</p>
      </footer>
    </div>
  );
}
