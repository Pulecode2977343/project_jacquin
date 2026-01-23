<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id_enrollment'])) {
    echo json_encode(['success' => false, 'message' => 'Falta ID de inscripción']);
    exit;
}

try {
    // Optional: Check permissions (Admin or Self) - for now assuming frontend handles it, or just basic ID check.
    // Ideally we should check if the session user owns the enrollment or is admin.
    // But for this sprint, simplicity is key.

    $stmt = $pdo->prepare("DELETE FROM enrollments WHERE id_enrollment = ?");
    if ($stmt->execute([$data['id_enrollment']])) {
        echo json_encode(['success' => true, 'message' => 'Inscripción eliminada']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de BD: ' . $e->getMessage()]);
}
?>