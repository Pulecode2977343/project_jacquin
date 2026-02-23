<?php
require_once '../config/cors.php';
header("Content-Type: application/json");
require_once "../config/connection.php";
require_once "rate_limit.php";

$ip_address = $_SERVER['REMOTE_ADDR'];

// 1. Verificar Rate Limit
if (!check_rate_limit($pdo, $ip_address)) {
    http_response_code(429); // Too Many Requests
    echo json_encode(["success" => false, "message" => "Demasiados intentos fallidos. Intenta en 15 minutos."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"] ?? null;
$password = $data["password"] ?? null;

if (!$email || !$password) {
    echo json_encode(["error" => "Faltan campos"]);
    exit;
}

// Buscar usuario
$sql = "SELECT * FROM usuario WHERE email = :email LIMIT 1";
$stmt = $pdo->prepare($sql);
$stmt->execute([":email" => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    // Log fallo
    log_login_attempt($pdo, $ip_address, $email, false);
    echo json_encode(["error" => "Correo no encontrado"]);
    exit;
}

// Verificar contraseña
if (!password_verify($password, $user["password"])) {
    // Log fallo
    log_login_attempt($pdo, $ip_address, $email, false);

    echo json_encode(["error" => "Contraseña incorrecta"]);
    exit;
}

// Log éxito
log_login_attempt($pdo, $ip_address, $email, true);

// Respuesta exitosa
echo json_encode([
    "success" => true,
    "message" => "Login correcto",
    "user" => [
        "id_usuario" => $user["id_usuario"],
        "full_name" => $user["full_name"],
        "email" => $user["email"],
        "id_rol" => $user["id_rol"]
    ]
]);

