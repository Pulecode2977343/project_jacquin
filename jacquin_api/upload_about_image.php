<?php
/**
 * Upload About Card Image
 * Sube imágenes para las tarjetas "Sobre Nosotros"
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    $errorMessage = 'No file uploaded';
    if (isset($_FILES['image'])) {
        switch ($_FILES['image']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMessage = 'File too large';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMessage = 'File partially uploaded';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMessage = 'No file selected';
                break;
        }
    }
    echo json_encode(['success' => false, 'error' => $errorMessage]);
    exit;
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5MB

// Validate file type
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Allowed: JPG, PNG, WebP, GIF']);
    exit;
}

// Validate file size
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File too large. Max 5MB']);
    exit;
}

// Create upload directory if not exists
$uploadDir = __DIR__ . '/../jacquin_web/pages/images/about/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'about_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
$targetPath = $uploadDir . $filename;

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Return relative URL for web access
    $webUrl = 'images/about/' . $filename;

    echo json_encode([
        'success' => true,
        'message' => 'Image uploaded successfully',
        'url' => $webUrl,
        'filename' => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save image']);
}
