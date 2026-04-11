<?php
// Disable display errors to keep JSON clean
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('memory_limit', '512M'); // High memory for image manipulation

require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once 'helpers/PathHelper.php';

$base_dir = PathHelper::getUploadBaseDir();
$target_dir = $base_dir . "images" . DIRECTORY_SEPARATOR;
$target_file = $target_dir . "hero-banner.jpg";

// --- IA / LOGIC SETTINGS ---
$TARGET_W = 1920;
$TARGET_H = 1080;
$QUALITY = 90; // High quality JPG

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        throw new Exception("Método inválido.");
    if (!isset($_FILES['hero_image']))
        throw new Exception("Sin imagen.");

    $file = $_FILES['hero_image'];
    if ($file['error'] !== UPLOAD_ERR_OK)
        throw new Exception("Error subida: " . $file['error']);

    // 1. Load Image logic
    $is_processed = false;

    if (extension_loaded('gd')) {
        try {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($file['tmp_name']);

            $src_img = null;
            switch ($mime) {
                case 'image/jpeg':
                    $src_img = @imagecreatefromjpeg($file['tmp_name']);
                    break;
                case 'image/png':
                    $src_img = @imagecreatefrompng($file['tmp_name']);
                    break;
                case 'image/webp':
                    $src_img = @imagecreatefromwebp($file['tmp_name']);
                    break;
            }

            if ($src_img) {
                // --- 0. CORRECCIÓN DE ROTACIÓN (EXIF) ---
                // Vital para fotos de celular. Si no, las coordenadas del frontend no coinciden.
                if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
                    $exif = @exif_read_data($file['tmp_name']);
                    if ($exif && isset($exif['Orientation'])) {
                        $ort = $exif['Orientation'];
                        if ($ort == 3)
                            $src_img = imagerotate($src_img, 180, 0);
                        if ($ort == 6)
                            $src_img = imagerotate($src_img, -90, 0);
                        if ($ort == 8)
                            $src_img = imagerotate($src_img, 90, 0);
                    }
                }

                $old_w = imagesx($src_img);
                $old_h = imagesy($src_img);

                $ratio_src = $old_w / $old_h;
                $ratio_target = $TARGET_W / $TARGET_H;

                $dst_img = imagecreatetruecolor($TARGET_W, $TARGET_H);

                // MODO 1: RECORTE MANUAL (Si recibimos coords del frontend)
                if (isset($_POST['crop_x']) && isset($_POST['crop_w'])) {
                    // Coordinates come relative to the ORIGINAL image resolution
                    $c_x = intval($_POST['crop_x']);
                    $c_y = intval($_POST['crop_y']);
                    $c_w = intval($_POST['crop_w']);
                    $c_h = intval($_POST['crop_h']);

                    // Validate bounds loosely to prevent crash
                    if ($c_w <= 0)
                        $c_w = $old_w;
                    if ($c_h <= 0)
                        $c_h = $old_h;

                    imagecopyresampled(
                        $dst_img,
                        $src_img,
                        0,
                        0,    // Dest 0,0
                        $c_x,
                        $c_y, // Source User Coords
                        $TARGET_W,
                        $TARGET_H, // Dest Full Size
                        $c_w,
                        $c_h // Source Chunk Size
                    );

                    // MODO 2: AUTO FILL (Blur Background) para Ratios extremos (> 0.2 diff)
                    // Se usa si NO hay recorte manual y la imagen es muy diferente (ej. vertical)
                } else if (abs($ratio_src - $ratio_target) > 0.2) {

                    // Fondo Desenfocado
                    imagecopyresampled($dst_img, $src_img, 0, 0, 0, 0, $TARGET_W, $TARGET_H, $old_w, $old_h);
                    for ($i = 0; $i < 30; $i++)
                        imagefilter($dst_img, IMG_FILTER_GAUSSIAN_BLUR);
                    imagefilter($dst_img, IMG_FILTER_BRIGHTNESS, -40);

                    // Imagen Central "Contain"
                    $scale = min($TARGET_W / $old_w, $TARGET_H / $old_h);
                    $new_w = floor($old_w * $scale);
                    $new_h = floor($old_h * $scale);
                    $x_pos = ($TARGET_W - $new_w) / 2;
                    $y_pos = ($TARGET_H - $new_h) / 2;

                    imagecopyresampled($dst_img, $src_img, $x_pos, $y_pos, 0, 0, $new_w, $new_h, $old_w, $old_h);

                } else {
                    // MODO 3: AUTO FIT (Cover) básico
                    $src_x = 0;
                    $src_y = 0;
                    $src_w = $old_w;
                    $src_h = $old_h;

                    if ($ratio_src > $ratio_target) { // Más ancha
                        $new_src_w = $old_h * $ratio_target;
                        $src_x = ($old_w - $new_src_w) / 2;
                        $src_w = $new_src_w;
                    } else { // Más alta
                        $new_src_h = $old_w / $ratio_target;
                        $src_y = ($old_h - $new_src_h) / 2;
                        $src_h = $new_src_h;
                    }
                    imagecopyresampled($dst_img, $src_img, 0, 0, $src_x, $src_y, $TARGET_W, $TARGET_H, $src_w, $src_h);
                }

                // E. Filtro Cinemático Global
                $filter = imagecreatetruecolor($TARGET_W, $TARGET_H);
                $darkness = imagecolorallocatealpha($filter, 0, 0, 0, 95); // ~30% opacidad
                imagefill($filter, 0, 0, $darkness);
                imagecopy($dst_img, $filter, 0, 0, 0, 0, $TARGET_W, $TARGET_H);
                imagefilter($dst_img, IMG_FILTER_CONTRAST, -5);

                // Save
                if (imagejpeg($dst_img, $target_file, $QUALITY)) {
                    imagedestroy($src_img);
                    imagedestroy($dst_img);
                    imagedestroy($filter);
                    if (file_exists($target_dir . "hero-banner.png"))
                        @unlink($target_dir . "hero-banner.png");
                    $is_processed = true;
                }
            }
        } catch (Exception $e) { /* Fallback */
        }
    }

    if (!$is_processed) {
        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            if (file_exists($target_dir . "hero-banner.png"))
                @unlink($target_dir . "hero-banner.png");
            echo json_encode(["success" => true, "message" => "Imagen subida (Sin proceso IA).", "timestamp" => time()]);
        } else {
            throw new Exception("Error al mover archivo.");
        }
    } else {
        echo json_encode(["success" => true, "message" => "Portada procesada exitosamente.", "timestamp" => time()]);
    }

} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>