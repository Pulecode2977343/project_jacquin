<?php
// setup_recovery.php
// Script único para actualizar la tabla de usuarios con campos de recuperación via Email

ini_set('display_errors', 1);
require_once __DIR__ . '/config/connection.php';

try {
    echo "Iniciando actualización de base de datos...\n";

    // 1. Verificar si las columnas ya existen
    $columns = $pdo->query("SHOW COLUMNS FROM usuario")->fetchAll(PDO::FETCH_COLUMN);

    // 2. Agregar 'recovery_code' si no existe
    if (!in_array('recovery_code', $columns)) {
        $pdo->exec("ALTER TABLE usuario ADD COLUMN recovery_code VARCHAR(6) NULL DEFAULT NULL AFTER password");
        echo "✅ Columna 'recovery_code' agregada.\n";
    } else {
        echo "ℹ️ Columna 'recovery_code' ya existe.\n";
    }

    // 3. Agregar 'recovery_expires' si no existe
    if (!in_array('recovery_expires', $columns)) {
        $pdo->exec("ALTER TABLE usuario ADD COLUMN recovery_expires DATETIME NULL DEFAULT NULL AFTER recovery_code");
        echo "✅ Columna 'recovery_expires' agregada.\n";
    } else {
        echo "ℹ️ Columna 'recovery_expires' ya existe.\n";
    }

    echo "🎉 Base de datos actualizada correctamente.\n";

} catch (PDOException $e) {
    die("❌ Error actualizando BD: " . $e->getMessage());
}
?>