#!/usr/bin/env python3
"""Wdrożenie www.pytlakprzewozy.pl przez FTPS (serwer h9.d2.pl, konto gpt@pytlakprzewozy.pl).

Strategia bez przestoju: pliki trafiają najpierw do katalogu roboczego poza stroną, potem dwie zmiany nazw
podmieniają `public_html`. Poprzednia wersja zostaje poza katalogiem publicznym (niedostępna z internetu).
`private_html` to symlink do `./public_html`, więc https podąża za podmianą automatycznie.

Użycie (z katalogu projektu, po `npm run build` bez NEXT_PUBLIC_BASE_PATH):
  scripts/deploy.py check                         sprawdza build i pokazuje plan (nic nie zmienia)
  scripts/deploy.py go --archive NAZWA            wgrywa i podmienia; obecny public_html → /NAZWA
  scripts/deploy.py rollback --archive NAZWA      przywraca /NAZWA jako public_html (bieżąca → /wycofana-…)
"""
import argparse, datetime, ftplib, importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "out")
spec = importlib.util.spec_from_file_location("ftps", os.path.join(HERE, "ftps.py"))
ftps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ftps)


def local_files():
    files = []
    for root, _, names in os.walk(OUT):
        for n in names:
            if n == ".DS_Store":
                continue
            full = os.path.join(root, n)
            files.append((os.path.relpath(full, OUT).replace(os.sep, "/"), os.path.getsize(full)))
    return sorted(files)


def check_build():
    problems = []
    def read(p):
        with open(os.path.join(OUT, p), encoding="utf-8") as fh:
            return fh.read()
    if not os.path.isdir(OUT):
        sys.exit("Brak katalogu out/ — uruchom najpierw: npm run build")
    robots, home = read("robots.txt"), read("index.html")
    if "Sitemap: https://www.pytlakprzewozy.pl/sitemap.xml" not in robots or "Disallow: /" in robots:
        problems.append("robots.txt nie jest produkcyjny (zbudowano z NEXT_PUBLIC_NOINDEX?)")
    if 'name="robots" content="noindex' in home:
        problems.append("strona główna ma noindex")
    if '"/pytlakbus/' in home or "/pytlakbus/_next" in home:
        problems.append("build ma prefiks /pytlakbus (zbudowano z NEXT_PUBLIC_BASE_PATH)")
    for need in [".htaccess", "404.html", "api/wyslij.php", "sitemap.xml", "kontakt/index.html", "flota/index.html"]:
        if not os.path.exists(os.path.join(OUT, need)):
            problems.append(f"brak pliku {need}")
    return problems


def ensure_dir(ftp, path, made):
    parts = path.strip("/").split("/")
    cur = ""
    for p in parts:
        cur += "/" + p
        if cur in made:
            continue
        try:
            ftp.mkd(cur)
        except ftplib.error_perm:
            pass  # istnieje
        made.add(cur)


def exists(ftp, path):
    parent, name = os.path.split(path.rstrip("/"))
    return any(n == name for n, _ in ftp.mlsd(parent or "/"))


def upload(ftp, target, files):
    made = set()
    ensure_dir(ftp, target, made)
    for i, (rel, _) in enumerate(files, 1):
        remote = f"{target}/{rel}"
        ensure_dir(ftp, os.path.dirname(remote), made)
        with open(os.path.join(OUT, rel), "rb") as fh:
            ftp.storbinary(f"STOR {remote}", fh)
        if i % 25 == 0 or i == len(files):
            print(f"  wgrano {i}/{len(files)}", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["check", "go", "rollback"])
    ap.add_argument("--archive", help="nazwa katalogu na poprzednią wersję (poza public_html)")
    a = ap.parse_args()

    if a.cmd == "check":
        files = local_files()
        problems = check_build()
        print(f"Plików do wysłania: {len(files)}, łącznie {sum(s for _, s in files)/1e6:.1f} MB")
        print("Build: " + ("OK" if not problems else "PROBLEMY:\n  - " + "\n  - ".join(problems)))
        print("Plan: wgranie do /nowa-strona-robocza → public_html przemianowany na /<archive> → nowa wersja jako public_html")
        sys.exit(1 if problems else 0)

    if not a.archive or "/" in a.archive or a.archive in ("public_html", "private_html"):
        sys.exit("Podaj bezpieczną nazwę: --archive np. stara-strona-wordpress-2026-10-21")

    ftp = ftps.connect()
    try:
        if a.cmd == "go":
            problems = check_build()
            if problems:
                sys.exit("Przerwano — problemy z buildem: " + "; ".join(problems))
            if exists(ftp, f"/{a.archive}"):
                sys.exit(f"/{a.archive} już istnieje na serwerze — wybierz inną nazwę")
            staging = "/nowa-strona-robocza"
            if exists(ftp, staging):
                sys.exit(f"{staging} już istnieje (przerwane wcześniejsze wdrożenie?) — sprawdź ręcznie")
            files = local_files()
            print(f"1/2 Wgrywanie {len(files)} plików do {staging} …")
            upload(ftp, staging, files)
            print("2/2 Podmiana katalogów …")
            ftp.rename("/public_html", f"/{a.archive}")
            try:
                ftp.rename(staging, "/public_html")
            except ftplib.Error:
                ftp.rename(f"/{a.archive}", "/public_html")  # natychmiastowy powrót, strona nie znika
                raise
            print(f"Gotowe. Poprzednia wersja: /{a.archive} (niedostępna z internetu).")
        else:
            if not exists(ftp, f"/{a.archive}"):
                sys.exit(f"Brak /{a.archive} na serwerze")
            stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M")
            ftp.rename("/public_html", f"/wycofana-{stamp}")
            ftp.rename(f"/{a.archive}", "/public_html")
            print(f"Przywrócono /{a.archive}. Wycofana wersja: /wycofana-{stamp}")
    finally:
        ftp.quit()


if __name__ == "__main__":
    main()
