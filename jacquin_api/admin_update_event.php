<?php
// API Endpoint: Update Event
// Admin only - Updates existing event with optional file uploads

session_start();
require_once 'config/cors.php';
require_once 'config/connection.php';

// Verify admin session
if (!isset($_SESSION['user']) || $_SESSION['user']['id_rol'] != 1) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado."]);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método inválido.");
    }

    $event_id = intval($_POST['event_id'] ?? 0);
    if ($event_id <= 0) {
        throw new Exception("ID de evento inválido.");
    }

    // Get current event data
    $stmt = $conn->prepare("SELECT image_url, media_url, media_type FROM events WHERE id_event = ?");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $current = $result->fetch_assoc();

    if (!$current) {
        throw new Exception("Evento no encontrado.");
    }

    // Extract form data
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $event_date = $_POST['event_date'] ?? null;
    $event_time = $_POST['event_time'] ?? null;
    $event_type = $_POST['event_type'] ?? 'otro';
    $location = trim($_POST['location'] ?? '');
    $cost = floatval($_POST['cost'] ?? 0);
    $is_featured = isset($_POST['is_featured']) ? 1 : 0;
    $media_type = $_POST['media_type'] ?? 'ninguno';
    $media_url_input = trim($_POST['media_url'] ?? '');

    if (empty($title)) {
        throw new Exception("El título es obligatorio.");
    }

    $upload_dir = "c:/xampp/htdocs/jacquin_web/pages/uploads/events/";
    $image_url = $current['image_url'];
    $media_url = $current['media_url'];

    // Process new image upload (replace old)
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $image_file = $_FILES['image'];
        $allowed_image = ['image/jpeg', 'image/png', 'image/webp'];
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($image_file['tmp_name']);

        if (!in_array($mime, $allowed_image)) {
            throw new Exception("Formato de imagen no válido.");
        }

        if ($image_file['size'] > 10 * 1024 * 1024) {
            throw new Exception("La imagen excede 10MB.");
        }

        // Delete old image
        if ($image_url && file_exists("c:/xampp/htdocs/jacquin_web/pages/" . $image_url)) {
            @unlink("c:/xampp/htdocs/jacquin_web/pages/" . $image_url);
        }

        $ext = pathinfo($image_file['name'], PATHINFO_EXTENSION);
        $image_filename = "event_" . $event_id . "_" . time() . "_img." . $ext;
        $image_path = $upload_dir . $image_filename;

        if (!move_uploaded_file($image_file['tmp_name'], $image_path)) {
            throw new Exception("Error al guardar la imagen.");
        }

        $image_url = "uploads/events/" . $image_filename;
    }

    // Process media update
    if ($media_type === 'video_youtube') {
        // Delete old file if exists
        if ($current['media_type'] !== 'video_youtube' && $current['media_url'] && file_exists("c:/xampp/htdocs/jacquin_web/pages/" . $current['media_url'])) {
            @unlink("c:/xampp/htdocs/jacquin_web/pages/" . $current['media_url']);
        }
        $media_url = $media_url_input;
    } elseif (in_array($media_type, ['video_nativo', 'pdf', 'ppt']) && isset($_FILES['media_file']) && $_FILES['media_file']['error'] === UPLOAD_ERR_OK) {
        $media_file = $_FILES['media_file'];
        $allowed_media = [
            'video_nativo' => ['video/mp4', 'video/webm'],
            'pdf' => ['application/pdf'],
            'ppt' => ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
        ];

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($media_file['tmp_name']);

        if (!in_array($mime, $allowed_media[$media_type])) {
            throw new Exception("Formato de archivo multimedia no válido.");
        }

        $max_sizes = [
            'video_nativo' => 50 * 1024 * 1024,
            'pdf' => 20 * 1024 * 1024,
            'ppt' => 20 * 1024 * 1024
        ];

        if ($media_file['size'] > $max_sizes[$media_type]) {
            throw new Exception("El archivo multimedia excede el tamaño máximo.");
        }

        // Delete old media file
        if ($current['media_url'] && file_exists("c:/xampp/htdocs/jacquin_web/pages/" . $current['media_url'])) {
            @unlink("c:/xampp/htdocs/jacquin_web/pages/" . $current['media_url']);
        }

        $ext = pathinfo($media_file['name'], PATHINFO_EXTENSION);
        $media_filename = "event_" . $event_id . "_" . time() . "_media." . $ext;
        $media_path = $upload_dir . $media_filename;

        if (!move_uploaded_file($media_file['tmp_name'], $media_path)) {
            throw new Exception("Error al guardar el archivo multimedia.");
        }

        $media_url = "uploads/events/" . $media_filename;
    } elseif ($media_type === 'ninguno') {
        // Delete old media if switching to none
        if ($current['media_url'] && $current['media_type'] !== 'video_youtube' && file_exists("c:/xampp/htdocs/jacquin_web/pages/" . $current['media_url'])) {
            @unlink("c:/xampp/htdocs/jacquin_web/pages/" . $current['media_url']);
        }
        $media_url = null;
    }

    // Update database
    $stmt = $conn->prepare("
        UPDATE events 
        SET title = ?, description = ?, event_date = ?, event_time = ?, event_type = ?, 
            location = ?, cost = ?, image_url = ?, media_type = ?, media_url = ?, is_featured = ?
        WHERE id_event = ?
    ");

    $stmt->bind_param(
        "ssssssdsssii",
        $title,
        $description,
        $event_date,
        $event_time,
        $event_type,
        $location,
        $cost,
        $image_url,
        $media_type,
        $media_url,
        $is_featured,
        $event_id
    );

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el evento.");
    }

    echo json_encode([
        "success" => true,
        "message" => "Evento actualizado exitosamente."
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>