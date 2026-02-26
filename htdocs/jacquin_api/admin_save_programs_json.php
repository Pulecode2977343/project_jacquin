<?php
// [SECURITY FIX 1] session_start() ANTES de cualquier header
session_start();
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/helpers/PathHelper.php';

header('Content-Type: application/json');

// 1. Verificación de sesión
if (!isset($_SESSION['user']) || $_SESSION['user']['id_rol'] != 1) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acceso denegado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    $input = file_get_contents("php://input");

    // Límite de Payload (Protección DDoS / Memory Exhaustion)
    if (strlen($input) > 20 * 1024 * 1024) {
        throw new Exception("Payload demasiado grande.");
    }

    $data = json_decode($input, true);

    if (!is_array($data) || empty($data)) {
        throw new Exception("Invalid JSON data");
    }

    // 2. Extracción de Base64 a archivo físico
    $uploadDir = PathHelper::getUploadBaseDir() . 'uploads' . DIRECTORY_SEPARATOR . 'programs' . DIRECTORY_SEPARATOR;
    PathHelper::ensureDir($uploadDir);

    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    foreach ($data as $key => &$program) {
        if (!is_array($program)) continue;

        $img = $program['image'] ?? '';

        if (str_starts_with($img, 'data:image/')) {
            // Extraer mime, extensión y datos binarios del Data URL
            if (!preg_match('/^data:(image\/(jpeg|jpg|png|webp|gif));base64,(.+)$/s', $img, $m)) {
                throw new Exception("Formato de imagen no válido en el programa '$key'.");
            }

            $ext = strtolower($m[2]) === 'jpeg' ? 'jpg' : strtolower($m[2]);

            if (!in_array($ext, $allowedExts)) {
                throw new Exception("Extensión de imagen no permitida en '$key'.");
            }

            $imgBinary = base64_decode($m[3], true);

            if ($imgBinary === false) {
                throw new Exception("Error decodificando la imagen en '$key'.");
            }

            if (strlen($imgBinary) > 5 * 1024 * 1024) {
                throw new Exception("Imagen en '$key' supera el límite de 5MB.");
            }

            // Nombre de archivo único y sin colisiones
            $filename = 'prog_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $filepath = $uploadDir . $filename;

            // [SECURITY FIX 3] LOCK_EX también en la escritura de la imagen
            if (file_put_contents($filepath, $imgBinary, LOCK_EX) === false) {
                throw new Exception("Error guardando la imagen '$filename' en disco.");
            }

            // Guardar solo la ruta relativa (unos pocos caracteres, no megabytes)
            $program['image'] = 'public/uploads/programs/' . $filename;
        }
    }
    unset($program); // Romper referencia del foreach

    $file = __DIR__ . '/data/programs.json';

    // [FIX 4] Permisos de directorio: solo propietario y grupo pueden escribir
    if (!is_dir(dirname($file))) {
        mkdir(dirname($file), 0755, true);
    }

    // [SECURITY FIX 3] Escritura atómica con LOCK_EX para evitar corrupción concurrente
    $written = file_put_contents(
        $file,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );

    if ($written === false) {
        throw new Exception("Error al escribir el archivo de programas.");
    }

    echo json_encode(['success' => true, 'message' => 'Programas guardados exitosamente.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
