<?php
// API Endpoint: Create Event
// Admin only - Creates new event with file uploads

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
    $media_url_input = trim($_POST['media_url'] ?? ''); // For YouTube URLs

    // Validate required fields
    if (empty($title)) {
        throw new Exception("El título es obligatorio.");
    }

    // Upload directory
    $upload_dir = "c:/xampp/htdocs/jacquin_web/pages/uploads/events/";
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    $image_url = null;
    $media_url = null;

    // Process main image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $image_file = $_FILES['image'];
        $allowed_image = ['image/jpeg', 'image/png', 'image/webp'];
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($image_file['tmp_name']);

        if (!in_array($mime, $allowed_image)) {
            throw new Exception("Formato de imagen no válido. Solo JPG, PNG, WEBP.");
        }

        if ($image_file['size'] > 10 * 1024 * 1024) { // 10MB
            throw new Exception("La imagen excede el tamaño máximo de 10MB.");
        }

        $ext = pathinfo($image_file['name'], PATHINFO_EXTENSION);
        $image_filename = "event_" . time() . "_img." . $ext;
        $image_path = $upload_dir . $image_filename;

        if (!move_uploaded_file($image_file['tmp_name'], $image_path)) {
            throw new Exception("Error al guardar la imagen.");
        }

        $image_url = "uploads/events/" . $image_filename;
    }

    // Process media file upload (video, PDF, PPT)
    if ($media_type === 'video_youtube') {
        // Use provided URL
        $media_url = $media_url_input;
    } elseif (in_array($media_type, ['video_nativo', 'pdf', 'ppt']) && isset($_FILES['media_file'])) {
        $media_file = $_FILES['media_file'];

        if ($media_file['error'] === UPLOAD_ERR_OK) {
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
                'video_nativo' => 50 * 1024 * 1024, // 50MB
                'pdf' => 20 * 1024 * 1024, // 20MB
                'ppt' => 20 * 1024 * 1024  // 20MB
            ];

            if ($media_file['size'] > $max_sizes[$media_type]) {
                throw new Exception("El archivo multimedia excede el tamaño máximo permitido.");
            }

            $ext = pathinfo($media_file['name'], PATHINFO_EXTENSION);
            $media_filename = "event_" . time() . "_media." . $ext;
            $media_path = $upload_dir . $media_filename;

            if (!move_uploaded_file($media_file['tmp_name'], $media_path)) {
                throw new Exception("Error al guardar el archivo multimedia.");
            }

            $media_url = "uploads/events/" . $media_filename;
        }
    }

    // Insert into database
    $stmt = $conn->prepare("
        INSERT INTO events (title, description, event_date, event_time, event_type, location, cost, image_url, media_type, media_url, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "ssssssdsssi",
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
        $is_featured
    );

    if (!$stmt->execute()) {
        throw new Exception("Error al crear el evento: " . $stmt->error);
    }

    $event_id = $conn->insert_id;

    echo json_encode([
        "success" => true,
        "message" => "Evento creado exitosamente.",
        "event_id" => $event_id
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>