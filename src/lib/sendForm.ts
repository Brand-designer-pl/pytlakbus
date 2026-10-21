import { asset } from '@/lib/asset';

export type SendResult = { ok: true } | { ok: false; reason: 'network' | 'limit' | 'invalid' | 'server' };

/** Wysyła zgłoszenie do public/api/wyslij.php (PHP na serwerze klienta). Lokalnie i na podglądzie bez PHP zwraca błąd. */
export async function sendForm(payload: Record<string, unknown>): Promise<SendResult> {
  try {
    const res = await fetch(asset('/api/wyslij.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    if (res.ok && body?.ok) return { ok: true };
    if (res.status === 429) return { ok: false, reason: 'limit' };
    if (res.status === 422 || res.status === 400) return { ok: false, reason: 'invalid' };
    return { ok: false, reason: 'server' };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export const sendErrorText: Record<Exclude<SendResult, { ok: true }>['reason'], string> = {
  network: 'Nie udało się wysłać zgłoszenia (brak połączenia z serwerem).',
  limit: 'Wysłano już kilka zgłoszeń z tego urządzenia — spróbuj za kilka minut.',
  invalid: 'Sprawdź poprawność danych w formularzu.',
  server: 'Serwer nie przyjął zgłoszenia.',
};
