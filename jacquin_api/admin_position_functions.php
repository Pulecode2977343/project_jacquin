<?php
/**
 * API CRUD para Funciones de Cargos
 * GET: Listar funciones de un cargo
 * POST: Agregar función
 * PUT: Actualizar función
 * DELETE: Eliminar función
 */
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Listar funciones de un cargo
            $positionId = isset($_GET['position_id']) ? intval($_GET['position_id']) : 0;

            if ($positionId <= 0) {
                echo json_encode(['success' => false, 'message' => 'ID de cargo requerido']);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT * FROM position_functions 
                WHERE position_id = ? 
                ORDER BY sort_order ASC
            ");
            $stmt->execute([$positionId]);
            $functions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $functions]);
            break;

        case 'POST':
            // Agregar función a un cargo
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['position_id']) || empty($data['description'])) {
                echo json_encode(['success' => false, 'message' => 'ID de cargo y descripción requeridos']);
                exit;
            }

            // Obtener el siguiente orden
            $orderStmt = $pdo->prepare("SELECT MAX(sort_order) as max_order FROM position_functions WHERE position_id = ?");
            $orderStmt->execute([$data['position_id']]);
            $maxOrder = $orderStmt->fetch(PDO::FETCH_ASSOC)['max_order'] ?? 0;

            $stmt = $pdo->prepare("
                INSERT INTO position_functions (position_id, description, sort_order, is_active)
                VALUES (?, ?, ?, 1)
            ");
            $stmt->execute([
                $data['position_id'],
                $data['description'],
                $maxOrder + 1
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Función agregada correctamente',
                'id' => $pdo->lastInsertId()
            ]);
            break;

        case 'PUT':
            // Actualizar función
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['id_function'])) {
                echo json_encode(['success' => false, 'message' => 'ID de función requerido']);
                exit;
            }

            $updates = [];
            $params = [];

            if (isset($data['description'])) {
                $updates[] = "description = ?";
                $params[] = $data['description'];
            }
            if (isset($data['is_active'])) {
                $updates[] = "is_active = ?";
                $params[] = $data['is_active'] ? 1 : 0;
            }
            if (isset($data['sort_order'])) {
                $updates[] = "sort_order = ?";
                $params[] = intval($data['sort_order']);
            }

            if (empty($updates)) {
                echo json_encode(['success' => false, 'message' => 'No hay datos para actualizar']);
                exit;
            }

            $params[] = $data['id_function'];
            $sql = "UPDATE position_functions SET " . implode(', ', $updates) . " WHERE id_function = ?";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['success' => true, 'message' => 'Función actualizada correctamente']);
            break;

        case 'DELETE':
            // Eliminar función
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['id_function'])) {
                echo json_encode(['success' => false, 'message' => 'ID de función requerido']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM position_functions WHERE id_function = ?");
            $stmt->execute([$data['id_function']]);

            echo json_encode(['success' => true, 'message' => 'Función eliminada correctamente']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Método no soportado']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>