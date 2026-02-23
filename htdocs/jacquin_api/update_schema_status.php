<?php
include 'config/connection.php';
try {
    $sql = "ALTER TABLE enrollments MODIFY COLUMN status ENUM('Activo', 'Completado', 'Cancelado', 'Pendiente') DEFAULT 'Pendiente'";
    $pdo->exec($sql);
    echo "<h1>Columna 'status' actualizada correctamente.</h1>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>