<?php

declare(strict_types=1);

require __DIR__ . '/system/config_bridge.php';

function failSso(string $message, int $code = 403): never
{
    http_response_code($code);
    header('Content-Type: text/plain; charset=utf-8');
    exit($message);
}

function readYaarzoBridgeEnv(): array
{
    $envFile = '/etc/yaarzo/codychat-sso.env';
    if (!is_readable($envFile)) {
        return [];
    }
    $parsed = parse_ini_file($envFile, false, INI_SCANNER_RAW);
    return is_array($parsed) ? $parsed : [];
}

$env = readYaarzoBridgeEnv();
$secret = $env['CODYCHAT_SSO_SECRET'] ?? '';

if ($secret === '') {
    failSso('SSO configuration invalid.', 500);
}

$token = $_GET['token'] ?? '';

if (!is_string($token) || $token === '') {
    failSso('Missing SSO token.');
}

$parts = explode('.', $token);

if (count($parts) !== 2) {
    failSso('Invalid SSO token.');
}

[$payloadEncoded, $signatureEncoded] = $parts;

$expectedSignature = rtrim(
    strtr(
        base64_encode(
            hash_hmac('sha256', $payloadEncoded, $secret, true)
        ),
        '+/',
        '-_'
    ),
    '='
);

if (!hash_equals($expectedSignature, $signatureEncoded)) {
    failSso('Invalid SSO signature.');
}

$payloadEncoded .= str_repeat(
    '=',
    (4 - strlen($payloadEncoded) % 4) % 4
);

$payloadJson = base64_decode(
    strtr($payloadEncoded, '-_', '+/'),
    true
);

if ($payloadJson === false) {
    failSso('Invalid SSO payload.');
}

$payload = json_decode($payloadJson, true);

if (!is_array($payload)) {
    failSso('Invalid SSO payload.');
}

$userId = (string)($payload['sub'] ?? '');
$username = trim((string)($payload['username'] ?? ''));
$avatar = trim((string)($payload['avatar'] ?? ''));
$avatarFp = trim((string)($payload['avatar_fp'] ?? ''));
$gender = strtolower(trim((string)($payload['gender'] ?? 'other')));
$expires = (int)($payload['exp'] ?? 0);

if (
    !preg_match(
        '/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
        $userId
    )
) {
    failSso('Invalid user.');
}

if ($username === '' || mb_strlen($username) > 50) {
    failSso('Invalid username.');
}

if ($expires < time() || $expires > time() + 120) {
    failSso('SSO token expired.');
}

if (!in_array($gender, ['male', 'female', 'other'], true)) {
    $gender = 'other';
}

if ($avatar !== '' && !bridgeValidateAvatarUrl($avatar)) {
    $avatar = '';
    $avatarFp = '';
}

if ($avatarFp !== '' && $avatar !== '' && $avatarFp !== bridgeAvatarFingerprint($avatar)) {
    $avatarFp = bridgeAvatarFingerprint($avatar);
}

$user = createBridgeUser('yaarzo', [
    'id' => $userId,
    'name' => $username,
    'gender' => $gender,
    'avatar' => $avatar,
    'avatar_fp' => $avatarFp,
    'age' => 0,
]);

if (empty($user)) {
    failSso('Unable to create chat session.', 500);
}

header('Location: /', true, 302);
exit;
