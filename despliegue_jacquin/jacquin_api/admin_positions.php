<?php
/**
 * API CRUD para Cargos (Positions)
 * GET: Listar cargos
 * POST: Crear cargo
 * PUT: Actualizar cargo
 * DELETE: Eliminar cargo
 */
include_once 'helpers/cors_helper.php';
handleCors();
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Listar todos los cargos con cantidad de funciones y usuarios asignados
            $includeHidden = isset($_GET['include_hidden']) && $_GET['include_hidden'] === 'true';

            $sql = "
                SELECT 
                    p.*,
                    COUNT(DISTINCT pf.id_function) as functions_count,
                    COUNT(DISTINCT up.id) as assigned_users_count
                FROM positions p
                LEFT JOIN position_functions pf ON p.id_position = pf.position_id AND pf.is_active = 1
                LEFT JOIN user_positions up ON p.id_position = up.position_id AND up.is_active = 1
            ";

            if (!$includeHidden) {
                $sql .= " WHERE p.is_visible = 1";
            }

            $sql .= " GROUP BY p.id_position ORDER BY p.is_predefined DESC, p.name ASC";

            $stmt = $pdo->query($sql);
            $positions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $positions]);
            break;

        case 'POST':
            // Crear nuevo cargo
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['name'])) {
                echo json_encode(['success' => false, 'message' => 'El nombre del cargo es requerido']);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO positions (name, icon, description, is_predefined, created_by)
                VALUES (?, ?, ?, 0, ?)
            ");
            $stmt->execute([
                $data['name'],
                $data['icon'] ?? '👤',
                $data['description'] ?? null,
                $data['created_by'] ?? null
            ]);

            $positionId = $pdo->lastInsertId();

            // Si vienen funciones, agregarlas
            if (!empty($data['functions']) && is_array($data['functions'])) {
                $stmtFunc = $pdo->prepare("
                    INSERT INTO position_functions (position_id, description, sort_order)
                    VALUES (?, ?, ?)
                ");

                $order = 1;
                foreach ($data['functions'] as $func) {
                    if (!empty($func)) {
                        $stmtFunc->execute([$positionId, $func, $order++]);
                    }
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Cargo creado correctamente',
                'id' => $positionId
            ]);
            break;

        case 'PUT':
            // Actualizar cargo
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['id_position'])) {
                echo json_encode(['success' => false, 'message' => 'ID de cargo requerido']);
                exit;
            }

            $updates = [];
            $params = [];

            if (isset($data['name'])) {
                $updates[] = "name = ?";
                $params[] = $data['name'];
            }
            if (isset($data['icon'])) {
                $updates[] = "icon = ?";
                $params[] = $data['icon'];
            }
            if (isset($data['description'])) {
                $updates[] = "description = ?";
                $params[] = $data['description'];
            }
            if (isset($data['is_visible'])) {
                $updates[] = "is_visible = ?";
                $params[] = $data['is_visible'] ? 1 : 0;
            }

            if (empty($updates)) {
                echo json_encode(['success' => false, 'message' => 'No hay datos para actualizar']);
                exit;
            }

            $params[] = $data['id_position'];
            $sql = "UPDATE positions SET " . implode(', ', $updates) . " WHERE id_position = ?";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['success' => true, 'message' => 'Cargo actualizado correctamente']);
            break;

        case 'DELETE':
            // Eliminar cargo
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['id_position'])) {
                echo json_encode(['success' => false, 'message' => 'ID de cargo requerido']);
                exit;
            }

            // Verificar que no sea predefinido
            $checkStmt = $pdo->prepare("SELECT is_predefined FROM positions WHERE id_position = ?");
            $checkStmt->execute([$data['id_position']]);
            $position = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($position && $position['is_predefined']) {
                echo json_encode(['success' => false, 'message' => 'No se pueden eliminar cargos predefinidos del sistema']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM positions WHERE id_position = ?");
            $stmt->execute([$data['id_position']]);

            echo json_encode(['success' => true, 'message' => 'Cargo eliminado correctamente']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Método no soportado']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>