<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';
require_once __DIR__ . '/helpers/PathHelper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$userId = isset($_POST['user_id']) ? $_POST['user_id'] : null;
$file = isset($_FILES['avatar_file']) ? $_FILES['avatar_file'] : (isset($_FILES['avatar']) ? $_FILES['avatar'] : null);

if (!$userId || !$file) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos (user_id o file)']);
    exit;
}

// Validate file
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Formato no permitido. Solo JPG, PNG o WEBP.']);
    exit;
}

// Correct path dynamic using PathHelper
$baseDir = PathHelper::getUploadBaseDir();
$uploadDir = $baseDir . 'uploads' . DIRECTORY_SEPARATOR . 'avatars' . DIRECTORY_SEPARATOR;
PathHelper::ensureDir($uploadDir);

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
if (empty($ext)) {
    $ext = ($file['type'] == 'image/png') ? 'png' : (($file['type'] == 'image/webp') ? 'webp' : 'jpg');
}
$filename = 'avatar_' . $userId . '_' . time() . '.' . $ext;
$targetPath = $uploadDir . $filename;

// Image Processing with GD (Premium Resizing/Rotation)
$srcPath = $file['tmp_name'];
$src = null;

try {
    switch ($file['type']) {
        case 'image/jpeg': $src = @imagecreatefromjpeg($srcPath); break;
        case 'image/png':  $src = @imagecreatefrompng($srcPath); break;
        case 'image/webp': $src = @imagecreatefromwebp($srcPath); break;
    }

    if (!$src) {
        // Fallback to move_uploaded_file if GD fails
        if (move_uploaded_file($srcPath, $targetPath)) {
            $saveSuccess = true;
        } else {
            throw new Exception("Error al procesar o mover imagen.");
        }
    } else {
        // Fix orientation if JPEG
        if ($file['type'] == 'image/jpeg' && function_exists('exif_read_data')) {
            $exif = @exif_read_data($srcPath);
            if ($exif && isset($exif['Orientation'])) {
                switch ($exif['Orientation']) {
                    case 3: $src = imagerotate($src, 180, 0); break;
                    case 6: $src = imagerotate($src, -90, 0); break;
                    case 8: $src = imagerotate($src, 90, 0); break;
                }
            }
        }

        $width = imagesx($src);
        $height = imagesy($src);
        $maxSize = 400;

        if ($width > $maxSize || $height > $maxSize) {
            $ratio = min($maxSize / $width, $maxSize / $height);
            $newWidth = floor($width * $ratio);
            $newHeight = floor($height * $ratio);
        } else {
            $newWidth = $width;
            $newHeight = $height;
        }

        $dst = imagecreatetruecolor($newWidth, $newHeight);

        if ($file['type'] == 'image/png' || $file['type'] == 'image/webp') {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
            imagefilledrectangle($dst, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        switch ($file['type']) {
            case 'image/jpeg': $saveSuccess = imagejpeg($dst, $targetPath, 85); break;
            case 'image/png':  $saveSuccess = imagepng($dst, $targetPath, 8); break;
            case 'image/webp': $saveSuccess = imagewebp($dst, $targetPath, 80); break;
        }

        imagedestroy($src);
        imagedestroy($dst);
    }

    if ($saveSuccess) {
        $webUrl = 'uploads/avatars/' . $filename;
        $stmt = $pdo->prepare("UPDATE usuario SET avatar_url = ? WHERE id_usuario = ?");
        $stmt->execute([$webUrl, $userId]);

        echo json_encode(['success' => true, 'data' => $webUrl, 'message' => 'Foto de perfil actualizada']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo guardar la imagen procesada.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>