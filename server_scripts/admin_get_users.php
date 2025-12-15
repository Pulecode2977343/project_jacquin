<?php
/**
 * public/admin_get_users.php
 * Endpoint para listar todos los usuarios (Solo ADMIN).
 */
declare(strict_types=1);

require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../config/connection.php";

ini_set('display_errors', '0');
error_reporting(E_ALL);

// ============ VALIDACIÓN SIMPLE DE ROL (Implementar JWT real en futuro) ============
// Por ahora confiamos en que la app solo llama esto si es Admin, 
// o se podría pasar un header 'X-Admin-Secret' si se quiere más seguridad rapida.
// ===================================================================================

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    json_response(["success" => false, "message" => "Método no permitido"], 405);
}

try {
    // Seleccionamos datos básicos. NO password.
    $sql = "SELECT id_usuario, full_name, email, id_rol, fecha_creacion FROM usuario ORDER BY id_usuario DESC";
    $st = $pdo->prepare($sql);
    $st->execute();
    $users = $st->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        "success" => true,
        "data" => $users
    ]);

} catch (PDOException $e) {
    json_response(["success" => false, "message" => "Error DB: " . $e->getMessage()], 500);
}
