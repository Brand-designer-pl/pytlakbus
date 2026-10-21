#!/usr/bin/env python3
"""FTPS dla pytlakprzewozy.pl (serwer h9.d2.pl, ProFTPD).

Hasło z pęku kluczy macOS (usługa „pytlak-ftp”), nigdy w argumentach ani logach.
ProFTPD wymaga wznowienia sesji TLS na kanale danych — stąd podklasa FTP_TLS.

Użycie:
  scripts/ftps.py ls [ścieżka]            lista katalogu
  scripts/ftps.py tree [ścieżka] [głębia]  drzewo katalogów (domyślnie głębia 2)
  scripts/ftps.py get <zdalna> <lokalna>   pobranie katalogu rekurencyjnie (kopia zapasowa)
"""
import ftplib, os, ssl, subprocess, sys

HOST, USER = "h9.d2.pl", "gpt@pytlakprzewozy.pl"


class ReusedSessionFTPS(ftplib.FTP_TLS):
    def ntransfercmd(self, cmd, rest=None):
        conn, size = ftplib.FTP.ntransfercmd(self, cmd, rest)
        if self._prot_p:
            conn = self.context.wrap_socket(conn, server_hostname=self.host, session=self.sock.session)
        return conn, size


def connect():
    pw = subprocess.run(["security", "find-generic-password", "-s", "pytlak-ftp", "-a", USER, "-w"],
                        capture_output=True, text=True, check=True).stdout.rstrip("\n")
    ctx = ssl.create_default_context()
    ftp = ReusedSessionFTPS(HOST, context=ctx, timeout=60)
    ftp.login(USER, pw)
    del pw
    ftp.prot_p()
    ftp.encoding = "utf-8"
    return ftp


def entries(ftp, path):
    try:
        return [(n, f.get("type"), int(f.get("size", 0) or 0)) for n, f in ftp.mlsd(path) if n not in (".", "..")]
    except ftplib.error_perm:
        out = []
        for line in ftp.nlst(path):
            out.append((os.path.basename(line), "?", 0))
        return out


def tree(ftp, path, depth, indent=""):
    for name, kind, size in sorted(entries(ftp, path), key=lambda e: (e[1] != "dir", e[0])):
        mark = "/" if kind == "dir" else f"  ({size} B)"
        print(f"{indent}{name}{mark}")
        if kind == "dir" and depth > 1:
            tree(ftp, f"{path.rstrip('/')}/{name}", depth - 1, indent + "  ")


def get(ftp, remote, local, counter):
    os.makedirs(local, exist_ok=True)
    for name, kind, _ in entries(ftp, remote):
        r, l = f"{remote.rstrip('/')}/{name}", os.path.join(local, name)
        if kind == "dir":
            get(ftp, r, l, counter)
        elif kind == "file":
            with open(l, "wb") as fh:
                ftp.retrbinary(f"RETR {r}", fh.write)
            counter[0] += 1
            if counter[0] % 200 == 0:
                print(f"  … {counter[0]} plików", flush=True)


if __name__ == "__main__":
    cmd, args = (sys.argv[1] if len(sys.argv) > 1 else "ls"), sys.argv[2:]
    ftp = connect()
    try:
        if cmd == "ls":
            for e in entries(ftp, args[0] if args else "/"):
                print(e)
        elif cmd == "tree":
            tree(ftp, args[0] if args else "/", int(args[1]) if len(args) > 1 else 2)
        elif cmd == "get":
            n = [0]; get(ftp, args[0], args[1], n); print(f"Pobrano plików: {n[0]}")
        else:
            sys.exit(__doc__)
    finally:
        ftp.quit()
