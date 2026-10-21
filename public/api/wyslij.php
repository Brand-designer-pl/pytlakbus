<?php
// Wysyłka zgłoszeń z formularzy (kontakt, rezerwacja) na adres firmy.
// Ochrona przed spamem: pole-pułapka, minimalny czas wypełnienia, limit zgłoszeń z jednego IP, sprawdzenie pochodzenia.
declare(strict_types=1);

const RECIPIENT = 'bus@pytlakprzewozy.pl';
const SENDER = 'strona@pytlakprzewozy.pl';
const ALLOWED_HOSTS = ['www.pytlakprzewozy.pl', 'pytlakprzewozy.pl'];
const RATE_LIMIT = 5;          // zgłoszeń…
const RATE_WINDOW = 600;       // …na 10 minut z jednego IP
const MIN_FILL_SECONDS = 3;    // szybciej wypełnia tylko bot

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function field(array $data, string $key, int $max = 500): string {
    $v = isset($data[$key]) && is_scalar($data[$key]) ? trim((string) $data[$key]) : '';
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr($v, 0, $max);
}

function oneLine(string $v): string {
    return trim(preg_replace('/[\r\n\t]+/', ' ', $v));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['ok' => false, 'error' => 'method']);

// Pochodzenie: tylko z własnej domeny (blokuje wysyłkę z cudzych stron).
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$originHost = $origin !== '' ? (parse_url($origin, PHP_URL_HOST) ?: '') : '';
if ($originHost !== '' && !in_array(strtolower($originHost), ALLOWED_HOSTS, true)) respond(403, ['ok' => false, 'error' => 'origin']);

$raw = file_get_contents('php://input', false, null, 0, 20000);
$data = json_decode($raw ?: '', true);
if (!is_array($data)) respond(400, ['ok' => false, 'error' => 'format']);

// Pole-pułapka (niewidoczne dla ludzi) i czas wypełnienia — po cichu „sukces”, żeby bot nie próbował dalej.
if (field($data, 'website') !== '') respond(200, ['ok' => true]);
$startedAt = (int) ($data['startedAt'] ?? 0);
if ($startedAt > 0 && (time() - intdiv($startedAt, 1000)) < MIN_FILL_SECONDS) respond(200, ['ok' => true]);

// Limit zgłoszeń z jednego IP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/pytlak-form-' . hash('sha256', $ip);
$hits = array_filter(is_file($rateFile) ? (array) json_decode((string) file_get_contents($rateFile), true) : [],
    fn($t) => is_int($t) && $t > time() - RATE_WINDOW);
if (count($hits) >= RATE_LIMIT) respond(429, ['ok' => false, 'error' => 'limit']);

$type = field($data, 'type', 20);
$name = oneLine(field($data, 'name', 120));
$phone = oneLine(field($data, 'phone', 40));
$email = oneLine(field($data, 'email', 160));
$consent = ($data['consent'] ?? false) === true;

if (!in_array($type, ['kontakt', 'rezerwacja'], true)) respond(400, ['ok' => false, 'error' => 'type']);
if (mb_strlen($name) < 2 || !$consent) respond(422, ['ok' => false, 'error' => 'fields']);
$phoneDigits = preg_replace('/\D/', '', $phone);
$emailValid = $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL);
if (strlen($phoneDigits) < 9 && !$emailValid) respond(422, ['ok' => false, 'error' => 'reach']);
if ($type === 'rezerwacja' && strlen($phoneDigits) < 9) respond(422, ['ok' => false, 'error' => 'phone']);

$lines = [];
if ($type === 'rezerwacja') {
    $subject = 'Rezerwacja przejazdu: ' . oneLine(field($data, 'date', 40)) . ' ' . oneLine(field($data, 'time', 10)) . ' — ' . $name;
    $lines = [
        'Nowa rezerwacja ze strony www.pytlakprzewozy.pl',
        '',
        'Termin:        ' . oneLine(field($data, 'date', 60)) . ', godz. ' . oneLine(field($data, 'time', 10)),
        'Liczba osób:   ' . oneLine(field($data, 'people', 5)),
        'Jak długo:     ' . oneLine(field($data, 'duration', 60)),
        'Pojazd:        ' . oneLine(field($data, 'vehicle', 80)),
        'Trasa:         ' . oneLine(field($data, 'route', 200)),
        '',
        'Imię i nazwisko: ' . $name,
        'Telefon:         ' . $phone,
        'E-mail:          ' . ($emailValid ? $email : '—'),
        '',
        'Uwagi:',
        field($data, 'notes', 2000) ?: '—',
    ];
} else {
    $subject = 'Wiadomość ze strony: ' . oneLine(field($data, 'topic', 80)) . ' — ' . $name;
    $lines = [
        'Nowa wiadomość ze strony www.pytlakprzewozy.pl',
        '',
        'Temat:           ' . oneLine(field($data, 'topic', 80)),
        'Imię i nazwisko: ' . $name,
        'Telefon:         ' . ($phone !== '' ? $phone : '—'),
        'E-mail:          ' . ($emailValid ? $email : '—'),
        '',
        'Wiadomość:',
        field($data, 'message', 4000) ?: '—',
    ];
}
$lines[] = '';
$lines[] = '— Zgoda na kontakt w sprawie zgłoszenia: tak. Wysłano: ' . date('Y-m-d H:i');

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: =?UTF-8?B?' . base64_encode('Strona PytlakBus') . '?= <' . SENDER . '>',
];
if ($emailValid) $headers[] = 'Reply-To: ' . $email;

$sent = mail(RECIPIENT, '=?UTF-8?B?' . base64_encode($subject) . '?=', implode("\n", $lines), implode("\r\n", $headers), '-f' . SENDER);
if (!$sent) respond(500, ['ok' => false, 'error' => 'mail']);

$hits[] = time();
@file_put_contents($rateFile, json_encode(array_values($hits)), LOCK_EX);
respond(200, ['ok' => true]);
