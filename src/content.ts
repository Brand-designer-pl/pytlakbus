import { asset } from '@/lib/asset';

// Treści i flota PytlakBus (źródło: new.pytlakprzewozy.pl/new/, 2026-09-24).
// Profile aut wygenerowane w Magnific ze zdjęć z folderu „pytlak-przewozy 2”.
export type Car = {
  id: string;
  name: string;
  blurb: string;
  seats: string;
  luggage: string;
  extra: string;
  image: string;
  ratio: number; // szerokość / wysokość wycinka
  size: number; // względna długość pojazdu w rzędzie (Sprinter = 1)
  spec?: Spec;
};

export type Spec = {
  lead: string;
  chips: string[];
  stats: { value: string; label: string }[];
  groups: { title: string; items: string[] }[];
  driver: { title: string; text: string };
};

// Specyfikacje ze stron pojazdów new.pytlakprzewozy.pl/new/… (2026-09-24).
const driver = { title: 'Wykwalifikowany kierowca', text: 'Każdy z naszych kierowców ma wieloletnie doświadczenie w przewozach osób oraz licencję szofera.' };

// Vito, Proace, Trafic 150 i 170 mają na stronie klienta identyczny opis.
const vanSpec = (lead: string): Spec => ({
  lead,
  chips: ['8 miejsc', '8 walizek', 'Extra long'],
  stats: [
    { value: '8', label: 'Miejsc pasażerskich z regulacją oparcia' },
    { value: '8', label: 'Walizek bagażu rejestrowanego' },
    { value: 'XL', label: 'Wersja extra long — bardzo dużo miejsca na bagaże' },
    { value: 'A/C', label: 'Oddzielna klimatyzacja dla pasażerów' },
  ],
  groups: [
    { title: 'Komfort podróży', items: ['Regulacja oparcia na wszystkich miejscach', 'Miejsca do ładowania telefonów', 'Bardzo dużo miejsca na bagaże'] },
    { title: 'Główne zalety', items: ['Przyciemniane szyby', 'Oddzielna klimatyzacja dla przestrzeni pasażerskiej', 'Dodatkowa nagrzewnica dla przestrzeni pasażerskiej'] },
  ],
  driver,
});

// Oba Sprintery prowadzą na stronie klienta do tej samej podstrony (opisuje wersję 20-osobową).
// UWAGA: strona główna klienta podaje „brak miejsca na bagaże”, podstrona — „przestronna przestrzeń ładunkowa”; przyjęto podstronę, do potwierdzenia.
const sprinterSpec = (seats: string, lead: string): Spec => ({
  lead,
  chips: [`${seats} miejsc`, 'Pasy 3-punktowe', 'Ekran multimedialny'],
  stats: [
    { value: seats, label: 'Miejsc, wszystkie z regulacją oparcia' },
    { value: '3-pkt', label: 'Pasy bezpieczeństwa na każdym miejscu' },
    { value: 'A/C', label: 'Indywidualne nawiewy dla każdego pasażera' },
    { value: 'XL', label: 'Przestronna przestrzeń bagażowa' },
  ],
  groups: [
    { title: 'Bezpieczeństwo i komfort', items: ['3-punktowe pasy na każdym miejscu', 'Regulacja oparcia na wszystkich miejscach', 'Własne oświetlenie i gniazdo ładowania'] },
    { title: 'Główne zalety', items: ['Przyciemniane szyby', 'Wydajne ogrzewanie', 'Ekran multimedialny'] },
  ],
  driver,
});

export const fleet: Car[] = [
  { id: 'sprinter21', name: 'Mercedes Sprinter 519 CDI', blurb: 'Minibus dla całej grupy. Klimatyzacja i ekran multimedialny.', seats: '20+1', luggage: 'Przestrzeń bagażowa', extra: 'Ekran multimedialny', image: asset('/media/fleet-sprinter21.webp'), ratio: 1600 / 665, size: 1,
    spec: sprinterSpec('20+1', 'Minibus dla całej grupy: 20 wygodnych miejsc z regulacją oparcia i 3-punktowymi pasami. Każdy pasażer ma własny nawiew, oświetlenie i gniazdo ładowania.') },
  { id: 'trafic150', name: 'Renault Trafic dCi 150', blurb: 'Grand Pack, wersja extra long. Miejsce na 8 walizek bagażu.', seats: '8', luggage: '8 walizek', extra: 'Osobna klimatyzacja', image: asset('/media/fleet-trafic150.webp'), ratio: 1600 / 689, size: 0.74,
    spec: vanSpec('Renault Trafic Grand Pack CLIM Blue dCi 150: 8 miejsc z regulacją oparcia i wersja extra long — miejsce na 8 walizek bagażu rejestrowanego.') },
  { id: 'toyota', name: 'Toyota Proace', blurb: '8 wygodnych miejsc, wersja extra long i osobna klimatyzacja dla pasażerów.', seats: '8', luggage: '8 walizek', extra: 'Ładowanie telefonów', image: asset('/media/fleet-toyota.webp'), ratio: 1600 / 635, size: 0.76,
    spec: vanSpec('8 miejsc pasażerskich z regulacją oparcia, wersja extra long i oddzielna klimatyzacja dla pasażerów. Miejsce na 8 walizek bagażu rejestrowanego.') },
  { id: 'v250d', name: 'Mercedes-Benz V250d', blurb: '6 wygodnych, regulowanych miejsc i rozkładany stolik. Miejsce na 8 walizek.', seats: '6', luggage: '8 walizek', extra: 'Rozkładany stolik', image: asset('/media/fleet-v250d.webp'), ratio: 1600 / 637, size: 0.78,
    // Źródło: new.pytlakprzewozy.pl/new/mercedes-v250/
    spec: {
      lead: '6 miejsc pasażerskich z regulacją oparcia, skórzana tapicerka i elektryczne drzwi przesuwne z obu stron. Wersja extra long — bardzo dużo miejsca na bagaże.',
      chips: ['6 miejsc', '8 walizek', 'Extra long'],
      stats: [
        { value: '6', label: 'Miejsc pasażerskich z regulacją oparcia' },
        { value: '8', label: 'Walizek bagażu rejestrowanego' },
        { value: '2×', label: 'Elektryczne drzwi przesuwne, z obu stron' },
        { value: 'XL', label: 'Wersja extra long' },
      ],
      groups: [
        { title: 'Dodatkowy komfort', items: ['Rozkładany stolik w przestrzeni pasażerskiej', 'Skórzana tapicerka', 'Regulacja oparcia na wszystkich miejscach'] },
        { title: 'Główne zalety', items: ['Przyciemniane szyby', 'Oddzielna klimatyzacja dla pasażerów', 'Dodatkowa nagrzewnica dla pasażerów', 'Miejsca do ładowania telefonów'] },
      ],
      driver,
    } },
  { id: 'vito', name: 'Mercedes-Benz Vito', blurb: '8 wygodnych miejsc, wersja extra long i miejsce do ładowania telefonów.', seats: '8', luggage: '8 walizek', extra: 'Ładowanie telefonów', image: asset('/media/fleet-vito.webp'), ratio: 1600 / 651, size: 0.76,
    spec: vanSpec('8 miejsc pasażerskich z regulacją oparcia i wersja extra long. Bardzo dużo miejsca na bagaże — 8 walizek bagażu rejestrowanego.') },
  { id: 'trafic170', name: 'Renault Trafic dCi 170', blurb: 'Grand Pack, wersja extra long. Osobna klimatyzacja dla pasażerów.', seats: '8', luggage: '8 walizek', extra: 'Osobna klimatyzacja', image: asset('/media/fleet-trafic170.webp'), ratio: 1600 / 707, size: 0.74,
    spec: vanSpec('Renault Trafic Grand Pack CLIM Blue dCi 170: 8 miejsc z regulacją oparcia, oddzielna klimatyzacja i dodatkowa nagrzewnica dla pasażerów.') },
  { id: 'sprinter24', name: 'Mercedes Sprinter 519 CDI', blurb: 'Cała grupa w jednym pojeździe. Klimatyzacja i ekran multimedialny.', seats: '22+2', luggage: 'Przestrzeń bagażowa', extra: 'Ekran multimedialny', image: asset('/media/fleet-sprinter24.webp'), ratio: 1600 / 640, size: 1,
    spec: sprinterSpec('22+2', 'Cała grupa w jednym pojeździe: miejsca z regulacją oparcia i 3-punktowymi pasami, indywidualne nawiewy, oświetlenie i gniazdo ładowania dla każdego.') },
];

/** Indeks pojazdu, w który zamienia się karta wideo (V250d — ten sam co na filmie). */
export const featuredIndex = 3;

// Pasek pod manifestem: wartości firmy ze strony (zamiast marek).
export const brands = ['Profesjonalizm', 'Bezpieczeństwo', 'Jakość', 'Nowoczesna flota', 'Certyfikat kompetencji', '24 h / 7 dni'];

export const copy = {
  city: 'Puszczykowo',
  titleMuted: 'Bezpieczeństwo',
  titleLines: ['& komfort', 'podróży'] as const,
  heroLead: 'Jesteśmy firmą z wieloletnim doświadczeniem w przewozie osób. Działamy 7 dni w tygodniu.',
  statement: ['Dbamy o komfort,', 'bezpieczeństwo i zadowolenie', 'naszych Klientów.', 'Do każdego podchodzimy', 'indywidualnie.'],
  collection: 'Nowoczesna i zadbana flota: od Mercedesa Vito po Sprintera na 22 osoby. Dla instytucji i grup prywatnych.',
};

// Dane kontaktowe i rejestrowe firmy (od klienta, 2026-10-20).
export const contact: {
  phone: { display: string; href: string } | null;
  phone2: { display: string; href: string } | null; // drugi numer (od klienta, 2026-10-30)
  email: string | null;
  address: string | null; // ulica i numer, kod pocztowy, miasto
  mapUrl: string | null; // link do Map Google
  hours: string;
} = {
  phone: { display: '+48 505 048 472', href: 'tel:+48505048472' },
  phone2: { display: '+48 505 048 473', href: 'tel:+48505048473' },
  email: 'bus@pytlakprzewozy.pl',
  address: 'ul. Topolowa 1, 62-040 Puszczykowo',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=ul.+Topolowa+1%2C+62-040+Puszczykowo',
  hours: '7 dni w tygodniu, 24 godziny na dobę',
};

export const company = {
  name: 'Pytlak Przewozy',
  owner: 'Jarosław Pytlak',
  nip: '777-173-70-38',
  regon: '362706751',
  website: { display: 'www.pytlakprzewozy.pl', href: 'https://www.pytlakprzewozy.pl' },
};

export const nav = [
  { id: 'start', label: 'Start' },
  { id: 'flota', label: 'Flota' },
  { id: 'o-nas', label: 'O nas' },
  { id: 'kontakt', label: 'Kontakt' },
] as const;

// Rezerwacja (telefon bierze się z `contact.phone`).
export const booking = {
  hours: 'Odbieramy 7 dni w tygodniu, 24 h na dobę',
  durations: [
    { id: 'transfer', label: 'Transfer', hint: 'do 3 h' },
    { id: 'half', label: 'Pół dnia', hint: 'do 6 h' },
    { id: 'day', label: 'Cały dzień', hint: 'do 12 h' },
    { id: 'multi', label: 'Kilka dni', hint: 'wyjazd' },
  ],
  maxPeople: 60,
};

// ——— Treści podstron SEO (ze starej strony www.pytlakprzewozy.pl: /oferta2/, /o-nas/, strona główna; 2026-10-21) ———
export const site = {
  url: 'https://www.pytlakprzewozy.pl',
  name: 'Pytlak Przewozy',
  brand: 'PytlakBus',
};

// Obszar działania potwierdzony przez klienta (jak na starej stronie).
export const area = ['Puszczykowo', 'Poznań', 'Mosina', 'Luboń', 'Wielkopolska', 'Polska', 'Europa'];

export const offer = {
  lead: 'Ofertę kierujemy zarówno do przedstawicieli instytucji, jak i do grup osób prywatnych. Do każdego klienta podchodzimy indywidualnie i z pełnym zrozumieniem jego potrzeb. Jesteśmy otwarci na sugestie i dokładamy starań, aby każdy klient był zadowolony i chętnie do nas wracał.',
  services: [
    'Transfery z lotnisk i hoteli',
    'Wycieczki',
    'Wyjazdy na szkolenia',
    'Wyjazdy na spotkania biznesowe, targi i konferencje',
    'Wyjazdy integracyjne',
    'Imprezy rodzinne: śluby, wesela, komunie i inne',
    'Wyjazdy objazdowe',
    'Wyjazdy wakacyjne',
    'Wyjazdy sportowe na turnieje i mecze',
    'Przejazdy pracownicze',
    'Pojazd z kierowcą do dyspozycji wynajmującego',
    'Wszelkie indywidualne życzenia',
  ],
};

export const about = {
  paragraphs: [
    'Firma Pytlak Przewozy Jarosław Pytlak świadczy usługi przewozu osób. Jesteśmy firmą z wieloletnim doświadczeniem w branży przewozu osób.',
    'Posiadamy Certyfikat Kompetencji Zawodowych w Krajowym i Międzynarodowym Przewozie Osób oraz Licencję na Wykonywanie Krajowego Przewozu Osób — potwierdzone przez Instytut Transportu Samochodowego.',
    'Od początku istnienia dokładamy wszelkich starań, aby nasze usługi były zawsze na najwyższym poziomie i spełniały wymagania oraz oczekiwania Klientów. Dbamy o komfort, bezpieczeństwo i zadowolenie pasażerów — zarówno na krótkich, jak i na dalekich trasach.',
    'W naszych szeregach są profesjonalni kierowcy, którzy zapewnią Państwu bezpieczeństwo i komfort jazdy. Współpracujemy z wieloma instytucjami: uczelniami, szkołami, firmami i innymi.',
    'Do każdego zamówienia podchodzimy indywidualnie.',
    'Serdecznie zapraszamy do współpracy!',
  ],
  values: [
    { title: 'Profesjonalizm', text: 'Wychodząc naprzeciw Twoim oczekiwaniom, działamy 7 dni w tygodniu i 24 godziny na dobę. Do każdego zlecenia podchodzimy indywidualnie.' },
    { title: 'Bezpieczeństwo', text: 'Bezpieczeństwo klientów i kierowców jest dla nas wartością nadrzędną. Nasi kierowcy to osoby z wieloletnim doświadczeniem.' },
    { title: 'Jakość', text: 'Dokładamy wszelkich starań, aby nasze usługi były zawsze na najwyższym poziomie.' },
    { title: 'Środowisko', text: 'W trosce o środowisko nasze pojazdy spełniają najwyższe normy emisji spalin, potwierdzone adnotacjami w dowodach rejestracyjnych.' },
  ],
};

// Metadane podstron (title/description/H1) — frazy lokalne ze starej strony, bez wymyślonych danych.
export const pages = {
  home: {
    title: 'Przewóz osób i wynajem busów z kierowcą — Puszczykowo, Poznań | Pytlak Przewozy',
    description: 'Przewóz osób busami 7 dni w tygodniu, 24 h na dobę: transfery z lotnisk, wycieczki, wyjazdy firmowe i rodzinne. Flota 6–24 miejsc. Puszczykowo, Poznań, Mosina, Luboń.',
  },
  oferta: {
    title: 'Oferta — transfery z lotniska, wycieczki, wyjazdy firmowe | Pytlak Przewozy',
    description: 'Przewozy dla firm, instytucji i osób prywatnych: transfery z lotnisk i hoteli, wycieczki, szkolenia, targi, wesela, wyjazdy sportowe i pracownicze. Puszczykowo i Poznań.',
    h1: 'Przewóz osób i wynajem busów z kierowcą',
  },
  flota: {
    title: 'Flota — busy 6–24 miejsc: Mercedes Sprinter, V-Class, Vito | Pytlak Przewozy',
    description: 'Nowoczesne busy z kierowcą: Mercedes Sprinter 519 CDI (20+1 i 22+2), Mercedes-Benz V250d, Vito, Toyota Proace, Renault Trafic. Klimatyzacja, przyciemniane szyby, pasy na każdym miejscu.',
    h1: 'Nasza flota',
  },
  oNas: {
    title: 'O nas — przewóz osób z licencją ITS | Pytlak Przewozy, Puszczykowo',
    description: 'Pytlak Przewozy Jarosław Pytlak — wieloletnie doświadczenie w przewozie osób, Certyfikat Kompetencji Zawodowych i licencja potwierdzone przez Instytut Transportu Samochodowego.',
    h1: 'O firmie Pytlak Przewozy',
  },
  kontakt: {
    title: 'Kontakt — Pytlak Przewozy, Puszczykowo | tel. +48 505 048 472',
    description: 'Zadzwoń lub napisz: tel. +48 505 048 472, bus@pytlakprzewozy.pl, ul. Topolowa 1, 62-040 Puszczykowo. Przewóz osób 7 dni w tygodniu, 24 h na dobę.',
  },
  polityka: {
    title: 'Polityka prywatności i plików cookies | Pytlak Przewozy',
    description: 'Informacje o przetwarzaniu danych osobowych (RODO) i plikach cookies w serwisie www.pytlakprzewozy.pl.',
    h1: 'Polityka prywatności',
  },
};
