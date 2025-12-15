<?php
/**
 * public/admin_update_role.php
 * Endpoint para actualizar el rol de un usuario (Solo ADMIN).
 */
declare(strict_types=1);

require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../config/connection.php";

ini_set('display_errors', '0');
error_reporting(E_ALL);

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    json_response(["success" => false, "message" => "Método no permitido"], 405);
}

// Leer JSON Body
$raw = file_get_contents("php://input");
$data = json_decode($raw ?: "{}", true);

$userId = isset($data["id_usuario"]) ? (int) $data["id_usuario"] : 0;
$roleId = isset($data["id_rol"]) ? (int) $data["id_rol"] : 0;

if ($userId <= 0 || $roleId <= 0) {
    json_response(["success" => false, "message" => "ID de usuario o rol inválido."]);
}

// Roles válidos: 1=Admin, 2=Teacher, 3=Student (Según lógica App)
if (!in_array($roleId, [1, 2, 3])) {
    json_response(["success" => false, "message" => "Rol no válido (Use 1, 2 o 3)."]);
}

try {
    $sql = "UPDATE usuario SET id_rol = ? WHERE id_usuario = ?";
    $st = $pdo->prepare($sql);
    $st->execute([$roleId, $userId]);

    if ($st->rowCount() > 0) {
        json_response(["success" => true, "message" => "Rol actualizado correctamente."]);
    } else {
        // Puede ser que el ID no exista o el rol ya era ese
        json_response(["success" => false, "message" => "No se realizaron cambios (usuario no existe o mismo rol)."]);
    }

} catch (PDOException $e) {
    json_response(["success" => false, "message" => "Error DB: " . $e->getMessage()], 500);
}
