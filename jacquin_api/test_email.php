<?php
// Script de prueba para envío de correos
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Prueba de Envío de Correo (Brevo)</h1>";

// 1. Cargar Entorno
echo "<p>Cargando entorno...</p>";
require_once __DIR__ . '/config/env_loader.php';

if (isset($_ENV['BREVO_API_KEY'])) {
    echo "<p style='color:green'>✅ API Key encontrada: " . substr($_ENV['BREVO_API_KEY'], 0, 5) . "...</p>";
} else {
    echo "<p style='color:red'>❌ Error: API Key NO encontrada en \$_ENV.</p>";
}

// 2. Instanciar Servicio
require_once __DIR__ . '/services/EmailService.php';
$emailService = new EmailService();

// 3. Intentar Enviar
$para = "tu_correo@ejemplo.com"; // Reemplázalo o usa un query param ?email=...
if (isset($_GET['email'])) {
    $para = $_GET['email'];
}

echo "<p>Intentando enviar a: <strong>$para</strong>...</p>";

$resultado = $emailService->sendWelcomeEmail($para, "Usuario Prueba");

if ($resultado) {
    echo "<h2 style='color:green'>✅ ¡ÉXITO! Correo enviado correctamente.</h2>";
} else {
    echo "<h2 style='color:red'>❌ FALLO. Revisa los logs de PHP o la consola.</h2>";
    echo "<p>Posibles causas: API Key inválida, bloqueo de cURL o error de SSL.</p>";
}
