<?php
declare(strict_types=1);
require_once '../config/cors.php';
/**
 * public/recover.php
 * Genera código de recuperación y lo envía por email usando Brevo API.
 */

require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../config/connection.php";
require_once __DIR__ . "/../config/env_loader.php";

ini_set('display_errors', '0');
error_reporting(E_ALL);

// ============ CONFIGURACIÓN ============

// OPCIÓN A: Pegar API Key DIRECTAMENTE aquí (Recomendado si falla el .env)
$brevoApiKey = 'tu_api_key_de_brevo_aqui';

// OPCIÓN B: Intentar leer de .env (solo si la de arriba sigue siendo el placeholder)
if ($brevoApiKey === '') {
    $brevoApiKey = getenv('BREVO_KEY') ?: $_ENV['BREVO_KEY'] ?? '';
}

$senderEmail = getenv('SENDER_EMAIL') ?: $_ENV['SENDER_EMAIL'] ?? 'visionarycode.team@gmail.com';
$senderName = getenv('SENDER_NAME') ?: $_ENV['SENDER_NAME'] ?? 'Jacquin Academia Musical';
define('CODE_EXPIRY_MINUTES', 15);

// =============================================

$raw = file_get_contents("php://input");
$data = json_decode($raw ?: "{}", true);

$email = isset($data["email"]) ? trim((string) $data["email"]) : "";

if ($email === "") {
    json_response(["success" => false, "message" => "Escribe tu correo."]);
}

// Verificar que el usuario existe (Usamos 'full_name')
$st = $pdo->prepare("SELECT full_name FROM usuario WHERE email = ?");
$st->execute([$email]);
$user = $st->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    json_response(["success" => false, "message" => "No se encuentra una cuenta con ese correo."]);
}

// Generar código de 6 dígitos
$code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expiresAt = date('Y-m-d H:i:s', strtotime('+' . CODE_EXPIRY_MINUTES . ' minutes'));

// Guardar en BD (eliminar anteriores para evitar duplicados)
$pdo->prepare("DELETE FROM recovery_codes WHERE email = ?")->execute([$email]);

$insert = $pdo->prepare("INSERT INTO recovery_codes (email, code, expires_at) VALUES (?, ?, ?)");
$insert->execute([$email, $code, $expiresAt]);

// Enviar email con Brevo API
$userName = $user['full_name'] ?? 'Usuario';
$errorDetails = "";
$emailSent = sendBrevoEmail($email, $userName, $code, $brevoApiKey, $senderEmail, $senderName, $errorDetails);

if (!$emailSent) {
    // MODIFICADO: Mostrar el error técnico para depurar
    json_response(["success" => false, "message" => "Error enviando correo: " . $errorDetails]);
}

json_response(["success" => true, "message" => "Te enviamos un código a tu correo."]);

// ============ FUNCIÓN PARA ENVIAR EMAIL CON BREVO ============
function sendBrevoEmail(
    string $toEmail,
    string $toName,
    string $code,
    string $apiKey,
    string $senderEmail,
    string
    $senderName,
    ?string &$errorOut = null
): bool {
    // Verificación básica
    if (empty($apiKey) || $apiKey === 'TU_API_KEY_DE_BREVO_AQUI') {
        $errorOut = "Falta API Key (Revisa recover.php linea 16)";
        return false;
    }

    $url = 'https://api.brevo.com/v3/smtp/email';

    $emailBody = "
<html>

<body style='font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;'>
    <div
        style='max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        <h2 style='color: #00346A; text-align: center;'>🎹 Jacquin Academia de Música</h2>
        <p>Hola <strong>$toName</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p style='text-align: center; margin: 25px 0;'>
            <span
                style='font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #00346A; color: white; padding: 15px 25px; border-radius: 10px;'>$code</span>
        </p>
        <p style='color: #666;'>Este código expira en " . CODE_EXPIRY_MINUTES . " minutos.</p>
        <p style='color: #999; font-size: 12px;'>Si no solicitaste este código, ignora este mensaje.</p>
    </div>
</body>

</html>
";

    $payload = [
        'sender' => [
            'name' => $senderName,
            'email' => $senderEmail
        ],
        'to' => [
            ['email' => $toEmail, 'name' => $toName]
        ],
        'subject' => 'Código de recuperación - Jacquin',
        'htmlContent' => $emailBody
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'accept: application/json',
        'api-key: ' . $apiKey,
        'content-type: application/json'
    ]);

    // DESCOMENTAR SOLO SI ESTÁS EN LOCALHOST Y TIENES ERROR DE SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

    $response = curl_exec($ch);
    $curlErr = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        return true;
    } else { // Capturar error para debug
        $cleanResp = strip_tags(substr($response, 0, 100)); // Limpiar HTML si lo hay
        $errorOut = "API Error ($httpCode): $cleanResp";
        if ($curlErr)
            $errorOut .= " | Curl: $curlErr";
        return false;
    }
}