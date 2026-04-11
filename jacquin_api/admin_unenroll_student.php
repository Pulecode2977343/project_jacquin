<?php
require_once 'config/cors.php';


header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config/connection.php';
require_once 'helpers/auth_helper.php';

// Solo administradores pueden desinscribir
validateAdmin();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id_enrollment'])) {
    echo json_encode(['success' => false, 'message' => 'Falta ID de inscripción']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM enrollments WHERE id_enrollment = ?");
    if ($stmt->execute([$data['id_enrollment']])) {
        // Clean up enrollment_schedules manually
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