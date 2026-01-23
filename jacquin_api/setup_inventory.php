<?php
// setup_inventory.php
// Script de un solo uso para crear la tabla 'inventario'

require_once 'config/env_loader.php';
require_once 'config/connection.php';

header('Content-Type: application/json');

try {
    $sql = "CREATE TABLE IF NOT EXISTS inventario (
        id_item INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        tipo ENUM('Instrumento', 'Equipo', 'Accesorio', 'Otro') NOT NULL,
        serial VARCHAR(50),
        estado ENUM('Nuevo', 'Bueno', 'Regular', 'Malo') DEFAULT 'Bueno',
        fecha_adquisicion DATE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);

    echo json_encode(["success" => true, "message" => "Tabla 'inventario' creada exitosamente."]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error creating table: " . $e->getMessage()]);
}
?>