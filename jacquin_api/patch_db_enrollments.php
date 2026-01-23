<?php
include_once 'config/connection.php';

try {
    echo "Agregando columna schedule_id a enrollments...\n";
    $sql = "ALTER TABLE enrollments ADD COLUMN schedule_id INT NULL AFTER course_id";
    $pdo->exec($sql);
    echo "Columna agregada con éxito.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    // Si ya existe, nos lo dirá
}
?>