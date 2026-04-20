<?php
/**
 * API para asignaciones de cargos a usuarios
 * GET: Listar asignaciones / Obtener cargos de un usuario
 * POST: Asignar cargo a usuario
 * DELETE: Remover asignación
 */
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';
require_once __DIR__ . '/helpers/auth_helper.php';
require_once __DIR__ . '/helpers/audit_helper.php';

validateAdmin();

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Si viene user_id, obtener cargos de ese usuario
            if (isset($_GET['user_id'])) {
                $userId = intval($_GET['user_id']);

                $stmt = $pdo->prepare("
                    SELECT 
                        up.*,
                        p.position_name,
                        p.icon as position_icon,
                        p.description as position_description,
                        u.full_name as assigned_by_name
                    FROM user_positions up
                    JOIN positions p ON up.position_id = p.id_position
                    LEFT JOIN usuario u ON up.assigned_by = u.id_usuario
                    WHERE up.user_id = ? AND up.is_active = 1
                    ORDER BY up.assigned_at DESC
                ");
                $stmt->execute([$userId]);
                $positions = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => $positions]);
            }
            // Si viene position_id, obtener usuarios con ese cargo
            elseif (isset($_GET['position_id'])) {
                $positionId = intval($_GET['position_id']);

                $stmt = $pdo->prepare("
                    SELECT 
                        up.*,
                        u.full_name,
                        u.email,
                        u.email,
                        r.descripcion as rol_name,
                        admin.full_name as assigned_by_name
                    FROM user_positions up
                    JOIN usuario u ON up.user_id = u.id_usuario
                    LEFT JOIN rol r ON u.id_rol = r.id_rol
                    LEFT JOIN usuario admin ON up.assigned_by = admin.id_usuario
                    WHERE up.position_id = ? AND up.is_active = 1
                    ORDER BY u.full_name ASC
                ");
                $stmt->execute([$positionId]);
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => $users]);
            }
            // Listar todas las asignaciones activas
            else {
                $stmt = $pdo->query("
                    SELECT 
                        up.*,
                        p.position_name,
                        p.icon as position_icon,
                        u.full_name,
                        u.email
                    FROM user_positions up
                    JOIN positions p ON up.position_id = p.id_position
                    JOIN usuario u ON up.user_id = u.id_usuario
                    WHERE up.is_active = 1
                    ORDER BY up.assigned_at DESC
                ");
                $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => $assignments]);
            }
            break;

        case 'POST':
            // Asignar cargo a usuario
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['user_id']) || empty($data['position_id'])) {
                echo json_encode(['success' => false, 'message' => 'Usuario y cargo son requeridos']);
                exit;
            }

            // Verificar si ya existe la asignación
            $checkStmt = $pdo->prepare("
                SELECT id FROM user_positions 
                WHERE user_id = ? AND position_id = ?
            ");
            $checkStmt->execute([$data['user_id'], $data['position_id']]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                // Reactivar si estaba inactivo
                $updateStmt = $pdo->prepare("
                    UPDATE user_positions 
                    SET is_active = 1, notified = 0, assigned_at = NOW(), assigned_by = ?
                    WHERE id = ?
                ");
                $updateStmt->execute([$data['assigned_by'] ?? null, $existing['id']]);
            } else {
                // Crear nueva asignación
                $stmt = $pdo->prepare("
                    INSERT INTO user_positions (user_id, position_id, assigned_by, notified)
                    VALUES (?, ?, ?, 0)
                ");
                $stmt->execute([
                    $data['user_id'],
                    $data['position_id'],
                    $data['assigned_by'] ?? null
                ]);
            }

            // Obtener nombre del cargo para el mensaje
            $posStmt = $pdo->prepare("SELECT position_name FROM positions WHERE id_position = ?");
            $posStmt->execute([$data['position_id']]);
            $posName = $posStmt->fetch(PDO::FETCH_ASSOC)['position_name'] ?? 'Cargo';

            // Auditoría
            logAudit($pdo, 'update', 'user_position', $data['user_id'], ['position' => $posName, 'action' => 'assignment']);

            echo json_encode([
                'success' => true,
                'message' => "Cargo '$posName' asignado correctamente"
            ]);
            break;

        case 'DELETE':
            // Remover asignación (soft delete)
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['id']) && (empty($data['user_id']) || empty($data['position_id']))) {
                echo json_encode(['success' => false, 'message' => 'Datos de asignación requeridos']);
                exit;
            }

            if (!empty($data['id'])) {
                $stmt = $pdo->prepare("UPDATE user_positions SET is_active = 0 WHERE id = ?");
                $stmt->execute([$data['id']]);
            } else {
                $stmt = $pdo->prepare("UPDATE user_positions SET is_active = 0 WHERE user_id = ? AND position_id = ?");
                $stmt->execute([$data['user_id'], $data['position_id']]);
            }

            // Auditoría
            logAudit($pdo, 'delete', 'user_position', $data['user_id'] ?? $data['id'], ['action' => 'unassignment']);

            echo json_encode(['success' => true, 'message' => 'Asignación removida correctamente']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Método no soportado']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>