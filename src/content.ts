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
  heroLead: 'Jesteśmy firmą z wieloletnim doświadczeniem w przewozie osób. Działamy 7 dni w tygodniu, 24 godziny na dobę.',
  statement: ['Dbamy o komfort,', 'bezpieczeństwo i zadowolenie', 'naszych Klientów.', 'Do każdego podchodzimy', 'indywidualnie.'],
  collection: 'Nowoczesna i zadbana flota: od Mercedesa Vito po Sprintera na 22 osoby. Dla instytucji i grup prywatnych.',
  // Do potwierdzenia: docelowy adres formularza/kontaktu (na stronie klienta są jeszcze dane z szablonu).
  contactUrl: 'https://new.pytlakprzewozy.pl/new/contacts/',
};

// Dane kontaktowe — DO UZUPEŁNIENIA. Strona klienta ma jeszcze dane z szablonu (Berlin, info@email.com, +1…),
// dlatego pola są puste (null) i na stronie wyświetlają się jako „do uzupełnienia”.
// Przykład po uzupełnieniu: phone: { display: '+48 600 700 800', href: 'tel:+48600700800' }
export const contact: {
  phone: { display: string; href: string } | null;
  email: string | null;
  address: string | null; // ulica i numer, kod pocztowy, miasto
  mapUrl: string | null; // link do Map Google
  hours: string;
} = {
  phone: null,
  email: null,
  address: null,
  mapUrl: null,
  hours: '7 dni w tygodniu, 24 godziny na dobę',
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
