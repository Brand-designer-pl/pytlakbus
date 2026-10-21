import { PageShell } from '@/components/SiteChrome';
import { company, contact, pages } from '@/content';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ ...pages.polityka, path: '/polityka-prywatnosci/' });

// PROJEKT do akceptacji klienta (2026-10-21) — opisuje faktyczne działanie serwisu: formularze wysyłane e-mailem,
// brak analityki, brak zewnętrznych skryptów i plików cookies śledzących. Przed publikacją zatwierdza właściciel firmy.
export default function Page() {
  return (
    <PageShell current="">
      <section className="page-hero">
        <p className="page-kicker" data-in>Informacje prawne</p>
        <h1 className="page-title page-title--sm" data-in>{pages.polityka.h1}</h1>
        <p className="page-lead" data-in>Poniżej wyjaśniamy, jak przetwarzamy dane osobowe osób korzystających z serwisu www.pytlakprzewozy.pl oraz jak serwis korzysta z plików cookies.</p>
      </section>

      <section className="page-section legal" data-in>
        <h2>1. Administrator danych</h2>
        <p>Administratorem danych osobowych jest {company.owner}, prowadzący działalność gospodarczą pod firmą {company.name} {company.owner}, {contact.address}, NIP {company.nip}, REGON {company.regon}. Kontakt w sprawach danych osobowych: {contact.email}, tel. {contact.phone?.display}.</p>

        <h2>2. Jakie dane i w jakim celu przetwarzamy</h2>
        <p>Przetwarzamy dane podane dobrowolnie w formularzu kontaktowym i formularzu rezerwacji: imię i nazwisko, numer telefonu, adres e-mail oraz informacje o planowanym przejeździe (termin, godzina, trasa, liczba osób, uwagi). Dane wykorzystujemy wyłącznie, aby odpowiedzieć na zapytanie, przygotować ofertę i zrealizować przewóz.</p>
        <p>Podstawą przetwarzania jest podjęcie działań na Twoje żądanie przed zawarciem umowy oraz jej wykonanie (art. 6 ust. 1 lit. b RODO), a także nasz prawnie uzasadniony interes polegający na prowadzeniu korespondencji i ewentualnym dochodzeniu lub obronie roszczeń (art. 6 ust. 1 lit. f RODO).</p>

        <h2>3. Jak długo przechowujemy dane</h2>
        <p>Dane z zapytań przechowujemy przez czas potrzebny do ich obsługi. Jeżeli dojdzie do realizacji przewozu — przez okres wymagany przepisami prawa (m.in. podatkowymi i rachunkowymi) oraz do upływu terminów przedawnienia roszczeń.</p>

        <h2>4. Komu przekazujemy dane</h2>
        <p>Dane nie są sprzedawane ani udostępniane innym podmiotom w celach marketingowych. Mogą mieć do nich dostęp wyłącznie podmioty świadczące nam usługi techniczne — dostawca hostingu i poczty elektronicznej — na podstawie umowy i tylko w zakresie niezbędnym do świadczenia tych usług. Nie przekazujemy danych poza Europejski Obszar Gospodarczy.</p>

        <h2>5. Twoje prawa</h2>
        <p>Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu. Masz także prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa). Podanie danych jest dobrowolne, ale bez nich nie odpowiemy na zapytanie. Nie podejmujemy decyzji w sposób zautomatyzowany ani nie profilujemy.</p>

        <h2>6. Pliki cookies i logi serwera</h2>
        <p>Serwis nie używa plików cookies do śledzenia, reklamy ani statystyk i nie zawiera zewnętrznych narzędzi analitycznych. Serwer hostingu, jak każdy serwer WWW, zapisuje techniczne logi (m.in. adres IP, datę i godzinę, rodzaj przeglądarki) w celu zapewnienia bezpieczeństwa i prawidłowego działania serwisu.</p>
        <p>Link „Dojazd — Mapy Google” prowadzi do zewnętrznej usługi Google, która działa według własnej polityki prywatności.</p>

        <h2>7. Zmiany polityki</h2>
        <p>Polityka może być aktualizowana, gdy zmieni się sposób działania serwisu. Aktualna wersja jest zawsze dostępna na tej stronie.</p>
      </section>
    </PageShell>
  );
}
