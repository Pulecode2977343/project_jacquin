<?php
// admin_compliance_crud.php
// CRUD Para la gestión de cumplimientos por parte del Administrador

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    if ($method === 'GET') {
        // LISTAR CUMPLIMIENTOS
        if ($action === 'list') {
            $sql = "SELECT * FROM compliance_items ORDER BY created_at DESC";
            $stmt = $pdo->query($sql);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $items]);
            exit;
        }

        // OBTENER UN CUMPLIMIENTO
        if ($action === 'get' && isset($_GET['id'])) {
            $sql = "SELECT * FROM compliance_items WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$_GET['id']]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $item]);
            exit;
        }
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input)
            $input = $_POST; // Fallback for form-data

        // CREAR
        if ($action === 'create') {
            $required = ['title', 'target_role'];
            foreach ($required as $f) {
                if (empty($input[$f]))
                    throw new Exception("Campo requerido faltante: $f");
            }

            $sql = "INSERT INTO compliance_items (title, description, media_type, media_url, target_role, due_date, is_active) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['title'],
                $input['description'] ?? '',
                $input['media_type'] ?? 'document',
                $input['media_url'] ?? '',
                $input['target_role'],
                !empty($input['due_date']) ? $input['due_date'] : null,
                isset($input['is_active']) ? $input['is_active'] : 1
            ]);

            echo json_encode(['success' => true, 'message' => 'Cumplimiento creado correctamente', 'id' => $pdo->lastInsertId()]);
            exit;
        }

        // ACTUALIZAR
        if ($action === 'update') {
            if (empty($input['id']))
                throw new Exception("ID requerido para actualizar");

            $sql = "UPDATE compliance_items SET 
                    title = ?, description = ?, media_type = ?, media_url = ?, target_role = ?, due_date = ?, is_active = ?
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['title'],
                $input['description'] ?? '',
                $input['media_type'] ?? 'document',
                $input['media_url'] ?? '',
                $input['target_role'],
                !empty($input['due_date']) ? $input['due_date'] : null,
                isset($input['is_active']) ? $input['is_active'] : 1,
                $input['id']
            ]);

            echo json_encode(['success' => true, 'message' => 'Cumplimiento actualizado']);
            exit;
        }

        // ELIMINAR
        if ($action === 'delete') {
            if (empty($input['id']))
                throw new Exception("ID requerido para eliminar");

            $sql = "DELETE FROM compliance_items WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$input['id']]);

            echo json_encode(['success' => true, 'message' => 'Cumplimiento eliminado']);
            exit;
        }
    }

    throw new Exception("Acción no válida o método incorrecto");

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>