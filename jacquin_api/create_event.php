<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

try {
    // 1. Handling Input (JSON or FormData)
    // When using FormData (for files), PHP populates $_POST and $_FILES automatically.
    // php://input is empty for multipart/form-data in standard PHP setup.

    $title = $_POST['title'] ?? null;
    $event_date = $_POST['event_date'] ?? null;

    if (!$title || !$event_date) {
        throw new Exception("Datos incompletos. Título y fecha son obligatorios.");
    }

    $description = $_POST['description'] ?? '';
    $location = $_POST['location'] ?? '';
    $video_url = $_POST['video_url'] ?? null;
    $stream_url = $_POST['stream_url'] ?? null;
    $is_live = isset($_POST['is_live']) ? 1 : 0;

    // File Handling
    $image_path = null;
    $video_path = null;
    $upload_dir = __DIR__ . '/uploads/';

    // Ensure upload dir exists
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // Handle Image Upload
    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
        $img_name = time() . '_img_' . basename($_FILES['image_file']['name']);
        $target_path = $upload_dir . $img_name;

        if (move_uploaded_file($_FILES['image_file']['tmp_name'], $target_path)) {
            $image_path = 'uploads/' . $img_name; // Relative URL for DB
        } else {
            throw new Exception("Error al subir la imagen.");
        }
    }

    // Handle Video Upload
    if (isset($_FILES['video_file']) && $_FILES['video_file']['error'] === UPLOAD_ERR_OK) {
        $vid_name = time() . '_vid_' . basename($_FILES['video_file']['name']);
        $target_path = $upload_dir . $vid_name;

        // Simple validation logic could go here (MIME type check)
        if (move_uploaded_file($_FILES['video_file']['tmp_name'], $target_path)) {
            $video_path = 'uploads/' . $vid_name;
        } else {
            throw new Exception("Error al subir el video.");
        }
    }

    // Consolidate Video Source: If Upload exists, it overrides URL
    // (Or we can store both, but frontend logic usually prioritized one)
    if ($video_path) {
        $video_url = $video_path; // We can use the same column or a separate one. Let's use video_url for simplicity if schema allows content flexibility.
        // Actually, schema has `video_url` VARCHAR(255). It fits.
    }

    // Insert
    $sql = "INSERT INTO events (title, description, event_date, location, image_url, video_url, stream_url, is_live) 
            VALUES (:title, :description, :event_date, :location, :image, :video, :stream, :live)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':title' => $title,
        ':description' => $description,
        ':event_date' => $event_date,
        ':location' => $location,
        ':image' => $image_path,
        ':video' => $video_url,
        ':stream' => $stream_url,
        ':live' => $is_live
    ]);

    echo json_encode(['success' => true, 'message' => 'Evento creado exitosamente']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>