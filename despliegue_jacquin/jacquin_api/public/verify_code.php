<?php
declare(strict_types=1);
require_once '../config/cors.php';
/**
 * public/verify_code.php
 * Valida si el código existe y no está expirado.
 */
require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../config/connection.php";

ini_set('display_errors', '0');
error_reporting(E_ALL);

$raw = file_get_contents("php://input");
$data = json_decode($raw ?: "{}", true);

$email = isset($data["email"]) ? trim((string) $data["email"]) : "";
$code = isset($data["code"]) ? trim((string) $data["code"]) : "";

if ($email === "" || $code === "") {
    json_response(["success" => false, "message" => "Faltan campos"]);
}

// Validación estricta solo dígitos y largo 6
if (!ctype_digit($code) || strlen($code) !== 6) {
    json_response(["success" => false, "message" => "Código inválido"]);
}

// Trae el último código para ese email (o el que coincide)
$st = $pdo->prepare("
SELECT code, expires_at
FROM recovery_codes
WHERE email = ?
ORDER BY expires_at DESC
LIMIT 1
");
$st->execute([$email]);
$row = $st->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    json_response(["success" => false, "message" => "Código inválido"]);
}

if (trim((string) $row["code"]) !== $code) {
    json_response(["success" => false, "message" => "Código inválido"]);
}

if (strtotime((string) $row["expires_at"]) < time()) {
    json_response([
        "success" => false,
        "message" => "Código
    expirado"
    ]);
}

json_response(["success" => true, "message" => "Código verificado"]);