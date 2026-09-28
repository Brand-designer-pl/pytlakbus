# Avelon Drive — landing (Next.js + GSAP)

- Pracuj po polsku. Stack: Next.js 16 (App Router), React 19, GSAP 3.15 (ScrollTrigger, SplitText, @gsap/react). Nie zmieniaj stacku bez prośby.
- Wzorce ruchu pochodzą z biblioteki `../../../premium-web-agent` (manifest: `patterns/manifest.json`). Przed zmianą ruchu przeczytaj `docs/DECISIONS.md` i pasujący wzorzec.
- Cała scena scrollowa jest w `src/components/Landing.tsx` (jedna oś czasu `T`, pin + scrub). Treści, flota i dane kontaktowe (`contact` — do uzupełnienia): `src/content.ts`. Podstrona: `src/app/kontakt` + `src/components/ContactPage.tsx`. Style: `src/app/globals.css` (układ bazowy = bez JS / reduced motion; `.is-staged` = tryb sceniczny).
- Zasady: treść widoczna bez JS; `prefers-reduced-motion` wyłącza pin/scrub; animuj transform/opacity (wyjątek opisany w DECISIONS); sprzątaj każdy trigger w kontekście `useGSAP`/`matchMedia`.
- Media w `public/media/` wygenerowane w Magnific (projekt „Avelon Drive — landing”) ze zdjęcia Mercedesa V-Class klienta. Przy poprawkach nadpisuj pliki pod tymi samymi nazwami; nie twórz wersji numerowanych.
- Komendy: `npm run dev` (port 3107), `npm run check`, `npm run build`.
- Debug w dev: w konsoli `__avelonSeek(t)` ustawia scenę na moment `t` osi czasu (0–9.6); etapy: 0, 3.3, 6.8, 9.6 (przewijanie ciągłe, scrub 1).
