<?php
require_once '../config/cors.php';
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/env_loader.php';

use Brevo\Client\Configuration;
use Brevo\Client\Api\TransactionalEmailsApi;
use Brevo\Client\Model\SendSmtpEmail;

header("Content-Type: application/json");

// Leer JSON
$input = json_decode(file_get_contents("php://input"), true);

// Validación
if (
    empty($input["full_name"]) ||
    empty($input["email"]) ||
    empty($input["n_phone"]) ||
    empty($input["message"]) ||
    !isset($input["accept_terms"])
) {
    echo json_encode(["error" => "Faltan campos"]);
    exit;
}

// Configurar API desde variables de entorno
$brevoApiKey = getenv('BREVO_API_KEY') ?: '';

$config = Configuration::getDefaultConfiguration()
    ->setApiKey('api-key', $brevoApiKey);

$apiInstance = new TransactionalEmailsApi(
    new GuzzleHttp\Client(),
    $config
);

// Contenido HTML
$html = "
<h2>Nuevo Contacto desde Jacquin</h2>
<p><strong>Nombre:</strong> {$input['full_name']}</p>
<p><strong>Email:</strong> {$input['email']}</p>
<p><strong>Teléfono:</strong> {$input['n_phone']}</p>
<p><strong>Mensaje:</strong><br>{$input['message']}</p>
";

// Configurar email
$sendSmtpEmail = new SendSmtpEmail([
    "sender" => [
        "name" => "Jacquin Contacto",
        "email" => "visionarycode.team@gmail.com"
    ],
    "to" => [
        [
            "email" => "visionarycode.team@gmail.com"
        ]
    ],
    "subject" => "Nuevo mensaje de contacto",
    "htmlContent" => $html
]);

// Enviar
try {
    $apiInstance->sendTransacEmail($sendSmtpEmail);
    echo json_encode(["success" => true, "message" => "Mensaje enviado"]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
