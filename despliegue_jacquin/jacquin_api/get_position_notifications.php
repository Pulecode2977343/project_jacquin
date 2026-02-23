<?php
/**
 * Obtener notificaciones de cargos pendientes para un usuario
 * y marcar como notificado
 */
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Obtener notificaciones pendientes de cargos
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

        if ($userId <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT 
                up.id,
                up.assigned_at,
                p.id_position,
                p.name as position_name,
                p.icon as position_icon,
                admin.full_name as assigned_by_name
            FROM user_positions up
            JOIN positions p ON up.position_id = p.id_position
            LEFT JOIN usuario admin ON up.assigned_by = admin.id_usuario
            WHERE up.user_id = ? AND up.is_active = 1 AND up.notified = 0
            ORDER BY up.assigned_at DESC
        ");
        $stmt->execute([$userId]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $notifications]);

    } elseif ($method === 'POST' || $method === 'PUT') {
        // Marcar notificación como vista
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['id'])) {
            // Marcar una específica
            $stmt = $pdo->prepare("UPDATE user_positions SET notified = 1 WHERE id = ?");
            $stmt->execute([$data['id']]);
        } elseif (isset($data['user_id'])) {
            // Marcar todas del usuario
            $stmt = $pdo->prepare("UPDATE user_positions SET notified = 1 WHERE user_id = ? AND notified = 0");
            $stmt->execute([$data['user_id']]);
        }

        echo json_encode(['success' => true, 'message' => 'Notificación marcada como vista']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>