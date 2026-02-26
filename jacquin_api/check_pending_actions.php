<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

try {
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    $roleId = isset($_GET['role_id']) ? intval($_GET['role_id']) : 0;

    $result = [
        'success' => true,
        'has_alerts' => false,
        'badges' => [
            'academic' => 0,
            'compliance' => 0
        ],
        'alerts' => []
    ];

    if ($roleId === 1) { // Admin
        // Check new registrations (Pre-inscrito) and pending approvals (Pendiente)
        $stmt = $pdo->query("SELECT COUNT(*) FROM enrollments WHERE status IN ('Pendiente', 'Pre-inscrito')");
        $pending = $stmt->fetchColumn();
        if ($pending > 0) {
            $result['has_alerts'] = true;
            $result['badges']['academic'] = $pending;
            $result['alerts'][] = [
                'type' => 'info',
                'title' => 'Nuevas Inscripciones',
                'message' => "Hay $pending solicitud(es) de inscripción por revisar.",
                'action' => 'open_academic',
                'count' => (int)$pending
            ];
        }
    }

    // Check recent position assignments (for any user)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_positions WHERE user_id = ? AND notified = 0 AND is_active = 1");
    $stmt->execute([$userId]);
    $newPositions = $stmt->fetchColumn();
    if ($newPositions > 0) {
        $result['has_alerts'] = true;
        $result['alerts'][] = [
            'type' => 'success',
            'title' => 'Nuevos Cargos',
            'message' => "Has sido asignado a $newPositions nuevo(s) cargo(s) o función(es).",
            'action' => 'open_positions'
        ];
    }

    echo json_encode($result);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
