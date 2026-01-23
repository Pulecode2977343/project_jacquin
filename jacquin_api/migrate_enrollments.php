<?php
include 'config/connection.php';
try {
    $pdo->exec("ALTER TABLE enrollments MODIFY schedule_id INT(11) NULL");
    $pdo->exec("ALTER TABLE enrollments MODIFY status ENUM('Activo','Completado','Cancelado','Pendiente','Pre-inscrito') DEFAULT 'Pendiente'");
    echo "Schema updated successfully";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>