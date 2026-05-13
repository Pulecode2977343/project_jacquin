<?php
/**
 * get_team_members.php
 * Retorna usuarios con rol Admin (1), Profesor (2) o Colaborador si existe
 * Para sección pública "Nuestro Equipo"
 */

header('Content-Type: application/json; charset=UTF-8');
require_once 'config/cors.php';

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

try {
    // Obtener admins y profesores (rol 1 y 2)
    $stmt = $pdo->prepare("
        SELECT 
            u.id_usuario,
            u.full_name,
            u.avatar_url,
            u.id_rol,
            (
                SELECT GROUP_CONCAT(p.position_name SEPARATOR ', ')
                FROM user_positions up
                JOIN positions p ON up.position_id = p.id_position
                WHERE up.user_id = u.id_usuario AND up.is_active = 1
            ) AS positions_text,
            (
                SELECT GROUP_CONCAT(pf.description SEPARATOR '; ')
                FROM user_positions up
                JOIN positions p ON up.position_id = p.id_position
                JOIN position_functions pf ON p.id_position = pf.position_id
                WHERE up.user_id = u.id_usuario AND up.is_active = 1
            ) AS functions_text
        FROM usuario u
        WHERE u.id_rol IN (1, 2, 5)
        ORDER BY u.id_rol ASC, u.full_name ASC
    ");

    $stmt->execute();
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agregar nombre de rol legible
    foreach ($members as &$member) {
        if (!empty($member['positions_text'])) {
            $member['role_name'] = $member['positions_text'];
        } else {
            switch ((int) $member['id_rol']) {
                case 1:
                    $member['role_name'] = 'Administrador';
                    break;
                case 2:
                    $member['role_name'] = 'Dirección / Profesor';
                    break;
                case 5:
                    $member['role_name'] = 'Secretaría Académica';
                    break;
                default:
                    $member['role_name'] = 'Colaborador';
            }
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
