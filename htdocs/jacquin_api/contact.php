<?php
// contact.php - Handle Contact Form Submissions

// 1. Config & CORS
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/env_loader.php';
require_once __DIR__ . '/services/EmailService.php';

// 2. JSON Input
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos inválidos."]);
    exit;
}

// 3. Extract & Sanitize
$nombre = htmlspecialchars($input['nombre'] ?? '');
$email = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
$telefono = htmlspecialchars($input['telefono'] ?? '');
$mensaje = htmlspecialchars($input['mensaje'] ?? '');
$origen = htmlspecialchars($input['origen'] ?? '');

// 4. Validate
if (empty($nombre) || empty($email) || empty($mensaje)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan campos obligatorios."]);
    exit;
}

// 5. Send Email
$emailService = new EmailService();
$sentAdmin = $emailService->sendContactEmail($email, $nombre, $telefono, $mensaje, $origen);

if ($sentAdmin) {
    // Send Auto-Reply to User
    $emailService->sendContactAckEmail($email, $nombre);

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Mensaje enviado exitosamente."]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Error al enviar el correo. Por favor verifica los logs de la API (data/email_errors.log).",
        "debug_info" => "Check Brevo API Key status."
    ]);
}
