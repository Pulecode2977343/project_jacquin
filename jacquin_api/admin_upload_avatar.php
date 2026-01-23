<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_POST['user_id']) || !isset($_FILES['avatar_file'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos']);
    exit;
}

$userId = $_POST['user_id'];
$file = $_FILES['avatar_file'];

// Validate file
$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Formato no permitido (JPG, PNG, WEBP)']);
    exit;
}

// Correct path relative to backend: ../jacquin_web/pages/uploads/avatars/
// We target the 'jacquin_web' symlink to ensure it matches the serving URL.
$uploadDir = __DIR__ . '/../jacquin_web/pages/uploads/avatars/';

// Create directory if not exists
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        echo json_encode(['success' => false, 'message' => 'No se pudo crear carpeta uploads: ' . $uploadDir]);
        exit;
    }
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'avatar_' . $userId . '_' . time() . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Web URL relative to the HTML page
    $webUrl = 'uploads/avatars/' . $filename;

    try {
        $checkCol = $pdo->query("SHOW COLUMNS FROM usuario LIKE 'avatar_url'");
        if ($checkCol->rowCount() == 0) {
            $pdo->exec("ALTER TABLE usuario ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL");
        }

        $stmt = $pdo->prepare("UPDATE usuario SET avatar_url = ? WHERE id_usuario = ?");
        $stmt->execute([$webUrl, $userId]);

        echo json_encode(['success' => true, 'data' => $webUrl, 'message' => 'Foto actualizada']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]);
    }
} else {
    $error = error_get_last();
    echo json_encode(['success' => false, 'message' => 'Error moviendo archivo: ' . ($error['message'] ?? 'Permisos?') . ' Destino: ' . $targetPath]);
}
?>