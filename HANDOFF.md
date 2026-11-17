# HANDOFF — strona www.pytlakprzewozy.pl (PytlakBus)

Stan na 2026-11-17. Przekazanie z czatu Claude Code do Codexa. Zasady projektu: `AGENTS.md` (ten folder) — przeczytaj najpierw. Historia decyzji: `docs/DECISIONS.md`.

## Cel
Strona firmy przewozowej Pytlak Przewozy (marka PytlakBus), Puszczykowo/Poznań. Zastąpiła WordPressa 2026-10-21 na https://www.pytlakprzewozy.pl z zachowaniem pozycji w Google (mapa 301 w `public/.htaccess`).

## Gdzie co jest
- Folder roboczy: `Projekty/avelon-drive/landing` (nazwa folderu historyczna — projekt zaczynał się jako „Avelon Drive”).
- Repo: `git@github.com:Brand-designer-pl/pytlakbus.git`, gałąź `main`, ostatni commit `6fc3395`. Podgląd GitHub Pages (noindex) budowany z `.github/workflows/pages.yml`.
- Scena scrollowa strony głównej: `src/components/Landing.tsx` (stała `T`, jedna oś czasu, pin + scrub 0.6). Treści, flota, kontakt, metadane: `src/content.ts`. Ikony usług: `src/components/ServiceIcon.tsx`.
- Wdrożenie: `scripts/deploy.py` (FTPS, hasło w pęku kluczy macOS, usługa `pytlak-ftp`). Kolejność: build → `deploy.py check` → `deploy.py go --archive <nowa-nazwa>`. Wgrywać tylko po zgodzie użytkownika.

## Zrobione w tym czacie (wszystko na żywej stronie)
- 2026-10-21 — płynniejszy scroll strony głównej: każde przejście tekstu połączone z ruchem obrazu/tła, bez martwych stref; na telefonach bez rozmycia (blur) dla wydajności.
- 2026-10-26/30 — monochromatyczne ikony SVG w kafelkach oferty (Start: 9, Oferta: 12).
- 2026-10-30 — poprawki klientki: Start bez „24 godziny na dobę” w leadzie; obszar działania + Polska, Europa; O nas bez „atrakcyjne stawki”, „Serdecznie zapraszamy…” osobnym akapitem, „Bezpieczeństwo” kończy się na „doświadczeniem.”; drugi telefon +48 505 048 473 (stopka, Kontakt, menu mobilne; rezerwacja i JSON-LD mają tylko główny numer).
- 2026-10-30 — w widoku szczegółów auto stoi tuż nad dolnym panelem (`g.centerY` liczone z pozycji `.detail-bar` w `measure()`).
- Kopie poprzednich wersji na serwerze (poza public_html): `stara-strona-wordpress-2026-10-21`, `poprzednia-wersja-2026-10-21-scroll`, `poprzednia-wersja-2026-10-30`, `poprzednia-wersja-2026-10-30-auto`.

## Otwarte / następne kroki
1. **Adres biuro@pytlakprzewozy.pl** — klientka chce, by wiadomości z formularzy trafiały też na ten adres. Skrzynkę musi założyć użytkownik w DirectAdmin (agent ma tylko FTP). Potem: zmienić `RECIPIENT` w `public/api/wyslij.php` (oba adresy albo tylko biuro@ — do decyzji), wgrać, wysłać formularz testowy i potwierdzić dostarczenie.
2. **„24 godziny na dobę” na Starcie** — zostało w stopce (wspólnej dla wszystkich stron, `contact.hours`) i w pasku haseł („24 h / 7 dni”, `brands` w content.ts). Czeka na decyzję, czy usunąć także tam.
3. **Opłaty** — domena opłacona do 2029-07-30 (rejestrator home.pl). Hosting najpewniej LH.pl (h9.d2.pl); termin i kwoty tylko w panelach klienta — czeka na zrzut/fakturę od użytkownika.
4. Z wcześniejszych etapów: akceptacja polityki prywatności przez klienta, Search Console (zgłoszenie sitemap), wizytówka Google, potwierdzenie, że maile z formularzy dochodzą na bus@.
5. Płynności przewijania nie mierzono na prawdziwym, słabszym telefonie — tylko emulacja i pomiar osi czasu.

## Pułapki
- **iCloud**: folder Dokumenty ma optymalizację miejsca — pliki stają się „dataless” i narzędzia (tsc, next, eslint) wiszą bez błędu. Sprawdzenie: `find . -path ./node_modules.nosync -prune -o -flags +dataless -print`. Pobieranie: odczyt plików (`cat > /dev/null`), `brctl download` nie działał. Nie przenosić folderów z iCloud na inny dysk (wymusza pobieranie wszystkiego).
- `.next` → `.next.nosync` i `node_modules` → `node_modules.nosync` to dowiązania (iCloud nie synchronizuje `.nosync`). `npm ci` zamienia dowiązanie na zwykły folder — po instalacji: `mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules`. ESLint ignoruje `node_modules.nosync/**`.
- Build produkcyjny bez `NEXT_PUBLIC_BASE_PATH` i `NEXT_PUBLIC_NOINDEX` (`deploy.py check` to wykrywa).
- Playwright nie ma internetu (tylko localhost); żywą stronę sprawdzać przeglądarką z dostępem do sieci. Ukryty panel przeglądarki wstrzymuje animacje (rAF = 0) — pomiary scrolla robić w widocznej karcie lub przez `__avelonSeek(t)`.
- `../kopia-wordpress-2026-10-20/` zawiera hasła i bazę — nigdy nie publikować.
