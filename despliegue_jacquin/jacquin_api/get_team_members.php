<?php
/**
 * get_team_members.php
 * Retorna usuarios con rol Admin (1), Profesor (2) o Colaborador si existe
 * Para sección pública "Nuestro Equipo"
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

try {
    // Obtener admins y profesores (rol 1 y 2)
    $stmt = $pdo->prepare("
        SELECT 
            id_usuario,
            full_name,
            avatar_url,
            id_rol
        FROM usuario 
        WHERE id_rol IN (1, 2)
        ORDER BY id_rol ASC, full_name ASC
    ");

    $stmt->execute();
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agregar nombre de rol legible
    foreach ($members as &$member) {
        switch ((int) $member['id_rol']) {
            case 1:
                $member['role_name'] = 'Administrador';
                break;
            case 2:
                $member['role_name'] = 'Profesor';
                break;
            default:
                $member['role_name'] = 'Colaborador';
        }

        // Default avatar si no tiene
        if (empty($member['avatar_url'])) {
            $member['avatar_url'] = null;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $members
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener miembros del equipo'
    ]);
}
