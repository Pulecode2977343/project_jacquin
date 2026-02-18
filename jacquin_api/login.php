<?php
// login.php - Iniciar Sesión en JACQUIN

// Configuración de errores para depuración (desactivar en producción)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
header('Content-Type: application/json');

try {
    // Incluir configuraciones esenciales dentro del try para capturar errores de conexión
    require_once __DIR__ . '/config/cors.php';
    require_once __DIR__ . '/config/connection.php';

    // Solo permitir POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido. Use POST.');
    }

    // Leer el input JSON
    $input = json_decode(file_get_contents('php://input'), true);

    // Si json_decode falla, intentar leer de POST normal form-data
    if (!$input) {
        $input = $_POST;
    }

    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    // Validar campos vacíos
    if (empty($email) || empty($password)) {
        throw new Exception('Por favor ingrese correo y contraseña.');
    }

    // Buscar usuario en la base de datos
    // Se asume tabla 'usuario' con columnas 'email', 'password', 'full_name', 'id_rol', 'id_usuario'
    // Se asume tabla 'usuario' con columnas 'email', 'password', 'full_name', 'id_rol', 'id_usuario', 'avatar_url'
    $stmt = $pdo->prepare("SELECT id_usuario, full_name, email, password, id_rol, avatar_url FROM usuario WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificar si el usuario existe
    if (!$user) {
        // Por seguridad, mensaje genérico
        throw new Exception('Credenciales incorrectas.');
    }

    // Verificar contraseña (Hash)
    // Nota: Si tus usuarios antiguos no tienen hash, esto fallará. 
    // Asegúrate de que registro use password_hash().
    if (!password_verify($password, $user['password'])) {
        throw new Exception('Credenciales incorrectas.');
    }

    // ¡Login Exitoso!
    // Aquí podrías generar un JWT, pero por ahora devolveremos los datos básicos del usuario
    // para que el frontend los guarde en localStorage/sessionStorage.

    // Remover password del array antes de enviarlo
    unset($user['password']);

    // Iniciar sesión PHP
    if (session_status() === PHP_SESSION_NONE) {
        // Set cookie params for Zrok/Cross-site if needed, but default usually works for same-origin
        // session_set_cookie_params(['samesite' => 'None', 'secure' => true]); 
        session_start();
    }
    $_SESSION['user'] = $user;
    $_SESSION['user_id'] = $user['id_usuario'];
    $_SESSION['id_rol'] = $user['id_rol'];

    echo json_encode([
        'success' => true,
        'message' => 'Inicio de sesión exitoso',
        'user' => $user,
        // 'token' => '...' // Futuro: Implementar JWT aquí
    ]);

} catch (Exception $e) {
    http_response_code(401); // Unauthorized
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
