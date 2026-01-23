<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/config/connection.php';

try {
    if (!isset($pdo)) {
        throw new Exception("Database connection failed");
    }

    $sql = "CREATE TABLE IF NOT EXISTS schedule_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        requested_day VARCHAR(20) NOT NULL,
        requested_time TIME NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'modified') DEFAULT 'pending',
        admin_response TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id_course) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);

    echo json_encode(["success" => true, "message" => "Table schedule_requests created successfully"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>