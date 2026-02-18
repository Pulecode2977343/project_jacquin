<?php
// Debug Script for Avatars and Courses
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Debug JACQUIN</h1>";

// 1. Check Avatar File
$avatarPath = __DIR__ . '/jacquin_api/public/uploads/avatars/avatar_29_1769562836.png';
echo "<h2>1. Verificación de Avatar</h2>";
echo "Buscando archivo en: " . $avatarPath . "<br>";
if (file_exists($avatarPath)) {
    echo "<strong style='color:green'>[OK] El archivo existe físicamente.</strong><br>";
    echo "Permisos: " . substr(sprintf('%o', fileperms($avatarPath)), -4);
} else {
    echo "<strong style='color:red'>[ERROR] El archivo NO existe en esa ruta.</strong>";
}

// 2. Check Course Clarinete
require_once 'jacquin_api/config/connection.php';
echo "<h2>2. Verificación de Curso 'Clarinete'</h2>";
try {
    $stmt = $pdo->query("SELECT * FROM courses WHERE course_name = 'Clarinete'");
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($course) {
        echo "<strong style='color:green'>[OK] Curso encontrado en BD:</strong><pre>" . json_encode($course, JSON_PRETTY_PRINT) . "</pre>";
    } else {
        echo "<strong style='color:red'>[ERROR] Curso 'Clarinete' NO encontrado en la base de datos.</strong>";
    }
} catch (Exception $e) {
    echo "Error SQL: " . $e->getMessage();
}
?>
