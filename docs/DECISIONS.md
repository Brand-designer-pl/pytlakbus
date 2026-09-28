# Decyzje — Avelon Drive landing

## 2026-09-24 — odwzorowanie referencji `avelon-drive-landing.mp4`
Referencja (6,9 s, przyspieszone nagranie): czarne hero z autem z góry → wideo kurczy się do zaokrąglonej karty na jasnym tle → manifest słowami z rozmyciem + marquee marek → karta zjeżdża i staje się szarym kafelkiem floty → rząd aut przejeżdża przez tekst kolekcji → wybrane auto rośnie, sąsiedzi odjeżdżają rozmyci → panel szczegółów kafelkami.

### Wzorce premium-web-agent (biblioteka 1.0.0)
- `hero-reveal` — adaptacja: wejście z `filter: blur` zamiast samego y, SplitText na słowa tytułu.
- `split-heading` — adaptacja: `type: 'words'` bez autoSplit, animacja w scrubowanej osi czasu (słowa są inline, więc zmiana szerokości nie wymaga ponownego podziału).
- `pinned-panels` — adaptacja: pin całej sceny `end = 8.5 × wysokość`, jedna oś czasu ze scrub 0.8 zamiast przesuwu poziomego; `invalidateOnRefresh` + wartości funkcyjne.
- `layout-refresh` (`observeLayout`), `motion-accessibility`, `performance-budget` — bez zmian.

### Odstępstwa
- Element `.morph` animuje `left/top/width/height` (nie transform), bo proporcje karty i kafelka floty różnią się od viewportu (szczególnie mobile) — skala transformem zniekształcałaby wideo i promień. To jeden element absolutny w pinowanym kontenerze (bez wpływu na układ innych elementów).
- Marquee marek i dryf floty są powiązane ze scrollem (nie auto-play), więc nie wymagają przycisku pauzy. Wideo hero ma przełącznik „Pause film”; przy reduced motion wideo nie startuje samo.
- Brak nowego wzorca w bibliotece: kandydat „scroll story z elementem współdzielonym (shared-element morph)” — do rozważenia po akceptacji klienta.

### Treści robocze
Ceny, opisy aut, liczba miast (+N), e-mail i godziny w stopce to placeholdery do potwierdzenia. Marka „Avelon Drive” i logo-znak są tymczasowe.

## 2026-09-24 — pełne przejścia między etapami (snap)
- ScrollTrigger `snap: { snapTo: 'labelsDirectional', duration: 0.9–2.2 s, ease: power2.inOut }` do etykiet `hero (0) → statement (3.3) → collection (6.8) → detail (9.6)`. Nawet krótki ruch scrolla dokańcza całe przejście w swoim kierunku; scrub 0.6.
- Świadomie bez przechwytywania kółka/dotyku (zasada premium-web-agent) — przewijanie pozostaje natywne, snap działa po jego zatrzymaniu.
- Dodano przystanek „collection”: rząd aut zatrzymuje się pod tekstem (`yMid`), a dopiero przy wyjściu tekstu wjeżdża do środka.
- Wejście hero używa `fromTo` z jawnymi wartościami końcowymi (odporność na podwójny mount StrictMode/HMR).

## 2026-09-24 — nowe wideo hero i flota Pytlak Przewozy
- Hero: nowy kadr bez szofera + wideo Seedance 2.5 (1080p, 8 s) — drzwi przesuwne otwierają się same, wnętrze w czarnej skórze. Nadpisano `hero.mp4` i `hero-poster.webp`.
- Flota zastąpiona 7 pojazdami ze strony new.pytlakprzewozy.pl/new/: Sprinter 519 CDI (20+1), Trafic dCi 150, Toyota Proace, V250d (środek, = auto z filmu), Vito, Trafic dCi 170, Sprinter 519 CDI (22+2).
- Profile boczne wygenerowane w Magnific ze zdjęć `pytlak-przewozy 2/*.png`; Trafic 150/170 i Sprinter 20+1 odbite lustrzanie lokalnie (wszystkie przodem w prawo). V250d = wcześniejszy profil V-Class.
- `size` w `content.ts` oddaje względną długość pojazdu w rzędzie (Sprinter = 1); na zbliżeniu wszystkie mają tę samą szerokość.
- Panel szczegółów: cena i miasto zastąpione realnymi danymi (miejsca, bagaż, wyposażenie) — strona klienta nie podaje cen. Specyfikacje przetłumaczone na angielski (strona w EN).

## 2026-09-24 — treści po polsku (PytlakBus)
- Całość przepisana na polski na podstawie new.pytlakprzewozy.pl/new/: hasło „Bezpieczeństwo & komfort podróży”, lead „firma z wieloletnim doświadczeniem… 7 dni w tygodniu, 24 h”, manifest „Dbamy o komfort, bezpieczeństwo i zadowolenie naszych Klientów”, pasek wartości (Profesjonalizm, Bezpieczeństwo, Jakość, Nowoczesna flota, Certyfikat kompetencji, 24 h / 7 dni), stopka „Zapytaj o termin / Umów przewóz na konkretny termin”.
- Logo PytlakBus (`logo-pytlakbus.png`, białe na przezroczystym) jako maska CSS — kolor dziedziczy z nagłówka (biały na wideo, czarny na jasnym tle). `lang="pl"`.
- Lokalizacja: Puszczykowo (ze stopki strony klienta). Dane kontaktowe na stronie klienta to jeszcze wypełniacze szablonu (Berlin, info@email.com) — przycisk „Przejdź do formularza” prowadzi do ich strony kontaktu; do potwierdzenia.
- Hero: gradient pod tekstem (czytelność na końcu filmu), wygasa wraz z treścią hero.
- Hero (poprawka): fotele przodem do kierunku jazdy. Nano Banana uparcie odwracał fotele tyłem — klatkę końcową zrobiono w GPT Image (edycja), a wideo Seedance 2.5 wygenerowano między klatką startową (zamknięte drzwi) i końcową. Próg drzwi bez napisów.

## 2026-09-24 — widok specyfikacji w obrębie strony (V250d, pierwsza propozycja)
- „Specyfikacja” otwiera `SpecView` bez przeładowania: `history.pushState` (#specyfikacja-v250d), „Wstecz”/Escape/„Wróć do floty” zamykają; fokus wraca na przycisk.
- Ruch: przejście FLIP — kopia zdjęcia startuje z pozycji auta na scenie i ląduje (transform: translate + scale) w kaflu po lewej; panel szczegółów chowa się w dół z rozmyciem; kafle specyfikacji wjeżdżają z prawej (x + blur, stagger). Zamknięcie = ta sama oś czasu odtworzona wstecz (×1.25).
- Oś czasu w kontekście `useGSAP` (zależność `open`); przy zmianie rozmiaru okna pozycje przeliczane bez animacji; reduced motion = stan końcowy bez ruchu. Przewijanie strony zablokowane klasą `spec-lock` (scrollbar-gutter: stable — brak skoku szerokości).
- Treść z new.pytlakprzewozy.pl/new/mercedes-v250/ (`spec` w `content.ts`). Pozostałe auta: przycisk „Specyfikacja” nadal prowadzi do kontaktu — dodanie `spec` w `content.ts` włącza widok automatycznie.

## 2026-09-24 — rezerwacja + przewijanie modułowe
- Wszystkie „Zarezerwuj” (nagłówek, manifest, panel auta, specyfikacja, stopka) otwierają `BookingDialog` bez przeładowania (#rezerwacja, „Wstecz”/Escape/tło zamykają; nad specyfikacją zamyka się tylko rezerwacja).
- Kolejność: najpierw duża karta „Zadzwoń” (tel:), potem formularz: pojazd (z panelu — wstępnie wybrany), liczba osób (stepper), jak długo (transfer / pół dnia / cały dzień / kilka dni), kalendarz (własny, pn–nd, przeszłe dni wyłączone, strzałki/PageUp/PageDown), godzina (co 30 min), trasa, imię, telefon, e-mail, uwagi, zgoda. Walidacja z komunikatami i fokusem na pierwszym błędzie; po wysłaniu podsumowanie.
- DO UZUPEŁNIENIA: numer telefonu (`booking.phone` w content.ts — teraz poglądowy, oznaczony na stronie) oraz wysyłka zgłoszenia (TODO w `BookingDialog.submit` — endpoint lub e-mail firmy). Obecnie formularz niczego nie wysyła.
- Przewijanie modułowe (na prośbę użytkownika, świadome odstępstwo od zasady premium-web-agent „nie przechwytuj kółka”): GSAP Observer (wheel + touch) w obrębie pinu; jeden gest = pełne przejście (ScrollToPlugin, 1.2–2.2 s, power2.inOut) do kolejnego przystanku, blokada do końca animacji + 450 ms na bezwładność touchpada. Klawiatura: ↓/PageDown/Spacja i ↑/PageUp/Shift+Spacja. Snap usunięty, scrub 0.3.
- Zabezpieczenia: wyłączone przy reduced motion (brak pinu), w oknach (`ignore: .spec, .booking`), poza sceną (stopka przewija się natywnie); powrót ze stopki dociąga do najbliższego przystanku; ostatni przystanek 1 px przed końcem pinu.

## 2026-09-24 — specyfikacje wszystkich pojazdów
- Dane z podstron new.pytlakprzewozy.pl/new/{mercedes-sprinter, renault-170, renault, mercedes-vito, toyota-proace}. Vito, Proace, Trafic 150 i 170 mają na stronie klienta identyczny opis → wspólny `vanSpec()` z osobnym leadem; oba Sprintery → `sprinterSpec()` (klient linkuje oba do tej samej podstrony).
- DO POTWIERDZENIA: Sprinter — strona główna klienta „brak miejsca na bagaże”, podstrona „przestronna przestrzeń ładunkowa”; przyjęto podstronę (także pigułka w panelu: „Przestrzeń bagażowa”). Wersja 22+2 nie ma własnej podstrony — opis jak dla 20+1.
- Układ specyfikacji zagęszczony, żeby przy 1440×900 prawa kolumna mieściła się bez przewijania.

## 2026-09-28 — powrót do ciągłego przewijania
- Na prośbę użytkownika usunięto przewijanie modułowe (Observer, ScrollToPlugin, obsługa klawiszy, dociąganie do przystanków) oraz wcześniejszy snap. Strona przewija się natywnie i płynnie; wszystkie wejścia/wyjścia są sterowane jedną osią czasu ze scrub 1 (wygładzenie). Zgodne z domyślną zasadą premium-web-agent (bez przechwytywania kółka).

## 2026-09-28 — nawigacja „Flota” + podstrona Kontakt
- Menu: „Flota” / „O nas” / „Start” płynnie przewijają (ScrollToPlugin, 0.8–3 s, power2.inOut, autoKill przy ruchu kółkiem) do etapu sceny — Flota = karuzela aut z panelem szczegółów (koniec osi, T.end). Po drodze odtwarzają się animacje. Bez sceny (reduced motion) działają zwykłe kotwice #start / #o-nas / #flota.
- Wejście z adresem /#flota, /#o-nas lub /#rezerwacja (np. z podstrony Kontakt) ustawia właściwy etap lub otwiera rezerwację (odczyt z opóźnieniem 150 ms — po własnym scrollu Next.js).
- „Kontakt” → `/kontakt` (App Router): nagłówek, tytuł, kafle danych (telefon, e-mail, lokalizacja, mapa) + formularz (imię, telefon lub e-mail, temat, wiadomość, zgoda; walidacja; potwierdzenie). Wysyłka — TODO jak w rezerwacji.
- Dane kontaktowe w jednym miejscu: `contact` w content.ts. Puste pola (null) wyświetlają się jako żółte „… — do uzupełnienia” (strona główna/rezerwacja/kontakt). Fikcyjny numer z rezerwacji usunięty.

## 2026-09-28 — menu: podkreślenie przy najechaniu, równe odstępy
- Linki menu: linia 1.5 px (kolor tekstu) rysowana od lewej do prawej (`::after`, scaleX 0→1, 0.55 s, cubic-bezier(0.65,0,0.35,1)); po zjechaniu cofa się w prawo. Działa też przy fokusie z klawiatury (obrys fokusu zostaje). Reduced motion: bez przejścia.
- Usunięto dodatkowy margines po „Start” — wszystkie pozycje mają jeden odstęp (clamp 20–44 px; 40 px przy 1440 px).
