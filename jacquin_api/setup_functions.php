<?php
require_once __DIR__ . '/../config/connection.php';

try {
    // Determine table engine
    $engine = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci';

    // Create Teacher Functions Table
    $sql = "CREATE TABLE IF NOT EXISTS teacher_functions (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        description VARCHAR(255) NOT NULL,
        type ENUM('Permanente', 'Periodo') NOT NULL DEFAULT 'Permanente',
        start_date DATE NULL,
        end_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        CONSTRAINT fk_functions_user FOREIGN KEY (user_id) REFERENCES users(id_usuario) ON DELETE CASCADE
    ) $engine";

    $pdo->exec($sql);
    echo "Tabla 'teacher_functions' creada correctamente.";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>