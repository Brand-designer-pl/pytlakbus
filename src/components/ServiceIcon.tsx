import type { ReactNode } from 'react';

/** Monochromatyczne ikony liniowe usług (kolor z currentColor). Kolejność = offer.services w content.ts.
 *  Część kształtów oparta na Lucide (licencja ISC). */
const icons: (() => ReactNode)[] = [
  // Transfery z lotnisk i hoteli
  () => <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  // Wycieczki
  () => <><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></>,
  // Wyjazdy na szkolenia
  () => <><path d="M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5M22 10v6" /></>,
  // Spotkania biznesowe, targi i konferencje
  () => <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  // Wyjazdy integracyjne
  () => <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  // Imprezy rodzinne
  () => <><circle cx="9" cy="15" r="5" /><circle cx="15" cy="15" r="5" /><path d="M13.5 6.5 15 5l1.5 1.5L15 8z" /></>,
  // Wyjazdy objazdowe
  () => <><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></>,
  // Wyjazdy wakacyjne
  () => <><path d="M8 12a4 4 0 0 1 8 0M12 3v2M4.9 5.9l1.4 1.4M19.1 5.9l-1.4 1.4M2 12h2M20 12h2" /><path d="M2 16c1.7 1.3 3.3 1.3 5 0s3.3-1.3 5 0 3.3 1.3 5 0 3.3-1.3 5 0M2 20c1.7 1.3 3.3 1.3 5 0s3.3-1.3 5 0 3.3 1.3 5 0 3.3-1.3 5 0" /></>,
  // Wyjazdy sportowe
  () => <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0z" /></>,
  // Przejazdy pracownicze
  () => <><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" /></>,
  // Pojazd z kierowcą do dyspozycji
  () => <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" /><path d="M12 14v8M10 12H2M14 12h8" /></>,
  // Indywidualne życzenia
  () => <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" /></>,
];

export function ServiceIcon({ index }: { index: number }) {
  const icon = icons[index]?.();
  if (!icon) return null;
  return (
    <svg className="tile-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {icon}
    </svg>
  );
}
