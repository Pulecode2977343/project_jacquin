<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// Ajuste de ruta robusto usando __DIR__
$configPath = __DIR__ . '/../config/connection.php';
$configPathRelative = __DIR__ . '/../../config/connection.php';

if (file_exists($configPath)) {
    require_once $configPath;
} elseif (file_exists($configPathRelative)) {
    require_once $configPathRelative;
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de configuración del servidor (DB).']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);


if (!isset($data['id_enrollment'])) {
    echo json_encode(['success' => false, 'message' => 'Falta ID de inscripción']);
    exit;
}

try {
    // Delete schedules associated with this enrollment first (if any cascading is needed, or just rely on ON DELETE CASCADE)
    // We'll trust FK constraints or direct deletion for now.
    
    $stmt = $pdo->prepare("DELETE FROM enrollments WHERE id_enrollment = ?");
    if ($stmt->execute([$data['id_enrollment']])) {
        // Also clean up enrollment_schedules manually if no CASCADE
        $stmt2 = $pdo->prepare("DELETE FROM enrollment_schedules WHERE enrollment_id = ?");
        $stmt2->execute([$data['id_enrollment']]);
        
        echo json_encode(['success' => true, 'message' => 'Inscripción eliminada correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo eliminar la inscripción']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de BD: ' . $e->getMessage()]);
}
?>
