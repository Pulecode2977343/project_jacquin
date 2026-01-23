<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

try {
    // Optional Key Filters
    $type = $_GET['type'] ?? null;
    $status = $_GET['status'] ?? null;

    $sql = "SELECT * FROM inventory";
    $params = [];
    $conditions = [];

    if ($type) {
        $conditions[] = "type = :type";
        $params[':type'] = $type;
    }

    if ($status) {
        $conditions[] = "status = :status";
        $params[':status'] = $status;
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $items]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>