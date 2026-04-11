<?php
require_once 'config/cors.php';


header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once 'config/connection.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No data provided"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Update Mission if provided
    if (isset($data['mission'])) {
        $stmt = $pdo->prepare("UPDATE web_mission SET title = :title, description = :description WHERE id = 1");
        $stmt->execute([
            ':title' => $data['mission']['title'] ?? 'Nuestra Misión',
            ':description' => $data['mission']['description']
        ]);
    }

    // 2. Update Values if provided
    if (isset($data['values']) && is_array($data['values'])) {
        // Simple approach: delete existing and re-insert or update individually
        // Here we'll update individually by ID for better data integrity
        $stmt_val = $pdo->prepare("UPDATE web_values SET 
            title = :title, 
            description = :description, 
            icon = :icon, 
            image_url = :image_url,
            is_active = :is_active
            WHERE id = :id");

        foreach ($data['values'] as $val) {
            if (isset($val['id'])) {
                $stmt_val->execute([
                    ':title' => $val['title'],
                    ':description' => $val['description'],
                    ':icon' => $val['icon'],
                    ':image_url' => $val['image_url'],
                    ':is_active' => isset($val['is_active']) ? (int) $val['is_active'] : 1,
                    ':id' => $val['id']
                ]);
            }
        }
    }

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Contenido actualizado correctamente"]);

} catch (PDOException $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>