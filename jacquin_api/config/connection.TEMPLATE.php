<?php
/**
 * PLANTILLA DE CONFIGURACIÓN PARA PRODUCCIÓN (InfinityFree)
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a "connection.php"
 * 2. Completa los datos con las credenciales que te dio InfinityFree
 * 3. NO subas este archivo a Git con las credenciales reales
 * 4. Sube el archivo configurado directamente al servidor vía FTP
 */

// ============================================
// CONFIGURACIÓN DE BASE DE DATOS
// ============================================
// Completa estos valores con los que te dio InfinityFree en tu panel

$host = 'sqlXXX.infinityfree.com';  // Ej: sql123.infinityfree.com
$dbname = 'ifdb_XXXXX_jacquin';     // Ej: ifdb_12345_jacquin
$username = 'ifdb_XXXXX';           // Ej: ifdb_12345
$password = 'TU_PASSWORD_AQUI';     // La contraseña que configuraste

// ============================================
// CONEXIÓN PDO (Principal)
// ============================================
try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ]
    );

} catch (PDOException $e) {
    // En producción, NO mostrar detalles del error
    error_log("Database Connection Error: " . $e->getMessage());
    die(json_encode([
        'success' => false,
        'message' => 'Error de conexión al servidor. Intenta más tarde.'
    ]));
}

// ============================================
// CONEXIÓN MYSQLI (Compatibilidad legacy)
// ============================================
$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log("MySQLi Connection Error: " . $conn->connect_error);
    die(json_encode([
        'success' => false,
        'message' => 'Error de conexión al servidor.'
    ]));
}

$conn->set_charset("utf8mb4");

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

// Deshabilitar display de errores en producción
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Zona horaria
date_default_timezone_set('America/Bogota');

?>