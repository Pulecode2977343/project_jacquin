<?php
declare(strict_types=1);
require_once '../config/cors.php';
/**
 * public/reset_password.php
 * 1) Verifica el código (email + code) y expiración
 * 2) Actualiza contraseña
 * 3) Elimina códigos usados
 */
require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../config/connection.php";

ini_set('display_errors', '0');
error_reporting(E_ALL);

$raw = file_get_contents("php://input");
$data = json_decode($raw ?: "{}", true);

$email = isset($data["email"]) ? trim((string) $data["email"]) : "";
$code = isset($data["code"]) ? trim((string) $data["code"]) : "";
$newPassword = isset($data["new_password"]) ? (string) $data["new_password"] : "";

if ($email === "" || $code === "" || $newPassword === "") {
    json_response(["success" => false, "message" => "Faltan campos"]);
}

// Validación mínima servidor (la app ya lo valida)
$hasMinLen = strlen($newPassword) >= 6;
$hasUpper = preg_match('/[A-Z]/', $newPassword);
$hasLower = preg_match('/[a-z]/', $newPassword);
$hasDigit = preg_match('/[0-9]/', $newPassword);
$hasSpec = preg_match('/[^A-Za-z0-9]/', $newPassword);

if (!($hasMinLen && $hasUpper && $hasLower && $hasDigit && $hasSpec)) {
    json_response([
        "success" => false,
        "message" => "La contraseña no cumple los requisitos (6+ chars, A-Z, a-z, 0-9,
especial)."
    ]);
}

// Verificar código exacto + expiración
$st = $pdo->prepare("
SELECT id, expires_at
FROM recovery_codes
WHERE email = ? AND code = ?
ORDER BY expires_at DESC
LIMIT 1
");
$st->execute([$email, $code]);
$row = $st->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    json_response(["success" => false, "message" => "Código inválido"]);
}

if (strtotime((string) $row["expires_at"]) < time()) {
    json_response([
        "success" => false,
        "message" => "Código
    expirado"
    ]);
}

// Actualizar password
$newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

$upd = $pdo->prepare("UPDATE usuario SET password = ? WHERE email = ?");
$upd->execute([$newPasswordHash, $email]);

// Consumir códigos (eliminas todos los del email para evitar reuso)
$pdo->prepare("DELETE FROM recovery_codes WHERE email = ?")->execute([$email]);

json_response(["success" => true, "message" => "Contraseña cambiada con éxito."]);